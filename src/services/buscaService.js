// src/services/buscaService.js - VERSÃO FINAL SEM COMENTÁRIOS PROBLEMÁTICOS

import { supabase } from './supabaseClient';

export const buscarPerfis = async (filtros) => {
  if (!filtros.habilidade) {
    return { data: [], error: { message: "A habilidade é um filtro obrigatório." } };
  }

  let query = supabase
    .from('view_busca_trabalhadores')
    .select(`
      id, 
      apelido, 
      titulo_profissional, 
      foto_perfil_url,
      avaliacao_media, 
      bairro, 
      cidade, 
      estado, 
      habilidades_texto
    `);

  query = query.ilike('habilidades_texto', `%${filtros.habilidade}%`);

  if (filtros.estado) {
    query = query.ilike('estado', `%${filtros.estado}%`);
  }
  if (filtros.cidade) {
    query = query.ilike('cidade', `%${filtros.cidade}%`);
  }
  if (filtros.bairro) {
    query = query.ilike('bairro', `%${filtros.bairro}%`);
  }

  query = query.eq('disponivel_para_servicos', true);
  query = query.eq('tipo_usuario', 'trabalhador');

  const { data, error } = await query;

  if (error) {
    console.error('Erro na busca final:', error);
    return { data: null, error };
  }

  return { data, error: null };
};
