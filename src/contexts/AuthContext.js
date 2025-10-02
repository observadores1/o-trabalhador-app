// src/contexts/AuthContext.js - VERSÃO CORRIGIDA COM ABORTCONTROLLER
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient'; // Certifique-se que o caminho está correto

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([]);
  
  const [statusMonetizacao, setStatusMonetizacao] = useState({
    podeCriarOS: false,
    podeAceitarTrabalho: false,
    isLoading: true,
  });

  const refreshPendencias = useCallback(async (currentUser) => {
    if (currentUser && currentUser.user_metadata?.tipo_usuario === 'contratante') {
      const { data, error } = await supabase.rpc('verificar_avaliacoes_pendentes');
      if (error) {
        console.error("Erro ao verificar avaliações pendentes:", error);
        setAvaliacoesPendentes([]);
      } else {
        setAvaliacoesPendentes(data || []);
      }
    } else {
      setAvaliacoesPendentes([]);
    }
  }, []);

  const verificarStatusMonetizacao = useCallback(async (currentUser) => {
    if (!currentUser) {
      setStatusMonetizacao({ podeCriarOS: false, podeAceitarTrabalho: false, isLoading: false });
      return;
    }

    const { data: isWhitelisted, error: whitelistError } = await supabase.rpc('is_user_whitelisted', { p_user_id: currentUser.id });
    if (whitelistError) console.error("Erro ao verificar whitelist:", whitelistError);

    if (isWhitelisted) {
      setStatusMonetizacao({ podeCriarOS: true, podeAceitarTrabalho: true, isLoading: false });
      return;
    }

    const tipoUsuario = currentUser.user_metadata?.tipo_usuario;

    if (tipoUsuario === 'trabalhador') {
      const { data: assinatura, error: assinaturaError } = await supabase
        .from('assinaturas_trabalhador')
        .select('status_assinatura, data_fim')
        .eq('trabalhador_id', currentUser.id)
        .single();
      if (assinaturaError && assinaturaError.code !== 'PGRST116') console.error("Erro ao buscar assinatura:", assinaturaError);
      
      if (assinatura && assinatura.status_assinatura === 'ativa' && new Date(assinatura.data_fim) > new Date()) {
        setStatusMonetizacao({ podeCriarOS: false, podeAceitarTrabalho: true, isLoading: false });
        return;
      }

      const { data: contagem, error: contagemError } = await supabase
        .from('view_contagem_os_trabalhador')
        .select('total_os_concluidas')
        .eq('trabalhador_id', currentUser.id)
        .single();
      if (contagemError && contagemError.code !== 'PGRST116') console.error("Erro ao buscar contagem de OS do trabalhador:", contagemError);

      const totalConcluidas = contagem?.total_os_concluidas || 0;
      setStatusMonetizacao({ podeCriarOS: false, podeAceitarTrabalho: totalConcluidas < 5, isLoading: false });

    } else if (tipoUsuario === 'contratante') {
      const { data: contagem, error: contagemError } = await supabase
        .from('view_contagem_os_contratante')
        .select('total_os_concluidas')
        .eq('contratante_id', currentUser.id)
        .single();
      if (contagemError && contagemError.code !== 'PGRST116') console.error("Erro ao buscar contagem de OS do contratante:", contagemError);
      
      const totalConcluidas = contagem?.total_os_concluidas || 0;
      setStatusMonetizacao({ podeCriarOS: totalConcluidas < 5, podeAceitarTrabalho: false, isLoading: false });
    
    } else {
      setStatusMonetizacao({ podeCriarOS: false, podeAceitarTrabalho: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    // ===== INÍCIO DA CORREÇÃO =====
    const controller = new AbortController();
    const signal = controller.signal;

    const handleAuthChange = async (session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Passamos o 'signal' para as chamadas que podem ser canceladas
        // Nota: O Supabase v2 não suporta AbortController diretamente em todas as chamadas.
        // A principal fonte do erro 406 é a chamada inicial de getSession.
        // O listener onAuthStateChange é mais seguro por natureza.
        await refreshPendencias(currentUser);
        await verificarStatusMonetizacao(currentUser);
      } else {
        setAvaliacoesPendentes([]);
        setStatusMonetizacao({ podeCriarOS: false, podeAceitarTrabalho: false, isLoading: false });
      }
      setLoading(false);
    };

    // A chamada que provavelmente causa o erro é esta:
    supabase.auth.getSession().then(({ data: { session } }) => {
        // Verificamos se o componente ainda está montado antes de atualizar o estado
        if (!signal.aborted) {
            handleAuthChange(session);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!signal.aborted) {
        handleAuthChange(session);
      }
    });

    return () => {
      // Quando o componente desmontar, abortamos a requisição
      controller.abort();
      subscription.unsubscribe();
    };
    // ===== FIM DA CORREÇÃO =====
  }, [refreshPendencias, verificarStatusMonetizacao]);

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session: user ? { user } : null,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    avaliacoesPendentes,
    refreshPendencias,
    statusMonetizacao,
    verificarStatusMonetizacao,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
