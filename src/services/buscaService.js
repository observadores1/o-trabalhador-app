import { supabase } from './supabaseClient';

export const buscarTrabalhadoresSupabase = async (habilidade, cidade, estado, bairro) => { // <-- Bairro adicionado aqui
  if (!habilidade || !habilidade.trim()) {
    return [];
  }

  try {
    const params = {
      habilidade_texto: habilidade.toLowerCase().trim()
    };

    if (cidade && cidade.trim()) {
      params.cidade_texto = cidade.toLowerCase().trim();
    }
    if (estado && estado.trim()) {
      params.estado_texto = estado.toLowerCase().trim();
    }
    if (bairro && bairro.trim()) { // <-- Lógica para adicionar o bairro
      params.bairro_texto = bairro.toLowerCase().trim();
    }

    console.log('Chamando RPC com os parâmetros:', params);
    
    const { data, error } = await supabase.rpc('buscar_perfis_por_habilidade_v2', params);

    if (error) {
      console.error('Erro ao chamar a função RPC de busca:', error);
      throw error;
    }

    console.log('Trabalhadores encontrados via RPC:', data);
    return data || [];

  } catch (error) {
    console.error('Erro inesperado na busca de trabalhadores:', error);
    return [];
  }
};