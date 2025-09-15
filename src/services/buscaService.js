import { supabase } from './supabaseClient';

/**
 * Busca trabalhadores usando a nova Função RPC no Supabase.
 * Esta é a única função de busca que deve ser usada.
 * @param {string} servico - Tipo de serviço/habilidade procurada.
 * @returns {Promise<Array>} Lista de trabalhadores encontrados.
 */
export const buscarTrabalhadoresSupabase = async (servico) => {
  // Se o campo de busca estiver vazio, retorna uma lista vazia imediatamente.
  if (!servico || !servico.trim()) {
    return [];
  }

  try {
    console.log(`Chamando RPC 'buscar_perfis_por_habilidade' com o serviço: ${servico}`);
    
    // Chama a função customizada (RPC) que criamos no Supabase.
    const { data, error } = await supabase.rpc('buscar_perfis_por_habilidade', {
      habilidade_texto: servico.toLowerCase().trim()
    });

    // Se o Supabase retornar um erro, nós o registramos no console e paramos.
    if (error) {
      console.error('Erro ao chamar a função RPC de busca:', error);
      throw error;
    }

    // Se tudo deu certo, retornamos os dados encontrados.
    // O '|| []' garante que, se 'data' for nulo, retornamos uma lista vazia.
    console.log('Trabalhadores encontrados via RPC:', data);
    return data || [];

  } catch (error) {
    // Se qualquer outro erro inesperado acontecer, registramos e retornamos uma lista vazia.
    console.error('Erro inesperado na busca de trabalhadores:', error);
    return [];
  }
};

/**
 * ATENÇÃO: Esta função está obsoleta e não deve ser usada.
 * Ela é mantida aqui temporariamente para evitar que o aplicativo quebre
 * em locais que ainda possam estar a chamando, mas ela não faz nada.
 * O objetivo é remover todas as chamadas a esta função.
 */
export const buscarTrabalhadoresFallback = (servico, localizacao) => {
  console.warn('A função obsoleta "buscarTrabalhadoresFallback" foi chamada. Ela não retorna mais dados.');
  return []; // Retorna sempre uma lista vazia.
};