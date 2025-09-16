import { supabase } from './supabaseClient';

export const buscarTrabalhadoresSupabase = async (habilidade, cidade, estado) => {
  // Se a habilidade não for fornecida, não faz a busca.
  if (!habilidade || !habilidade.trim()) {
    return [];
  }

  try {
    // Monta o objeto de parâmetros para a RPC
    const params = {
      habilidade_texto: habilidade.toLowerCase().trim()
    };

    // Adiciona os parâmetros de localização apenas se eles foram preenchidos
    if (cidade && cidade.trim()) {
      params.cidade_texto = cidade.toLowerCase().trim();
    }
    if (estado && estado.trim()) {
      params.estado_texto = estado.toLowerCase().trim();
    }

    console.log('Chamando RPC com os parâmetros:', params);
    
    // Chama a função RPC com todos os parâmetros
    const { data, error } = await supabase.rpc('buscar_perfis_por_habilidade', params);

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
