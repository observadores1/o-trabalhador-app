// src/contexts/AuthContext.js - VERSÃO FINAL, ESTÁVEL E CORRIGIDA
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

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

  useEffect(() => {
    const handleAuthChange = async (session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await refreshPendencias(currentUser);
      } else {
        setAvaliacoesPendentes([]);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleAuthChange(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, [refreshPendencias]);

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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
