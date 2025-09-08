import { supabase } from './supabaseClient';

/**
 * Busca trabalhadores no Supabase baseado em habilidade e localização
 * @param {string} servico - Tipo de serviço/habilidade procurada
 * @param {string} localizacao - Localização (cidade/bairro)
 * @returns {Promise<Array>} Lista de trabalhadores encontrados
 */
export const buscarTrabalhadoresSupabase = async (servico, localizacao) => {
  try {
    console.log('Buscando trabalhadores:', { servico, localizacao });
    
    // Query base para buscar perfis profissionais com dados do perfil
    let query = supabase
      .from('perfis_profissionais')
      .select(`
        *,
        perfis (
          id,
          nome_completo,
          email,
          telefone,
          endereco,
          foto_perfil_url
        )
      `)
     .eq('disponivel_para_servicos', true) // Apenas trabalhadores disponíveis

    // Filtro por habilidade (se fornecido)
    if (servico && servico.trim()) {
      const servicoLower = servico.toLowerCase().trim();
      query = query.contains('habilidades', [servicoLower]);
    }

    // Executar a query
    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar trabalhadores:', error);
      throw error;
    }

    console.log('Dados brutos do Supabase:', data);

    // Filtrar por localização no lado do cliente (se fornecido)
    let resultados = data || [];
    
    if (localizacao && localizacao.trim()) {
      const localizacaoLower = localizacao.toLowerCase().trim();
      resultados = resultados.filter(item => {
        const endereco = item.perfis?.endereco || '';
        return endereco.toLowerCase().includes(localizacaoLower);
      });
    }

    // Transformar os dados para o formato esperado pela interface
    const trabalhadoresFormatados = resultados.map(item => ({
      id: item.perfil_id,
      nome: item.perfis?.nome || 'Nome não informado',
      foto: item.perfis?.foto_perfil_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      avaliacao: 4.5, // Valor padrão - pode ser calculado de uma tabela de avaliações
      totalAvaliacoes: 0, // Valor padrão - pode ser calculado de uma tabela de avaliações
      habilidades: item.habilidades || [],
      precoMinimo: 80, // Valor padrão - pode vir de uma tabela de preços
      localizacao: item.perfis?.endereco || 'Localização não informada',
      servicos: (item.habilidades || []).map(h => h.toLowerCase()),
      biografia: item.biografia || '',
      telefone: item.perfis?.telefone || '',
      email: item.perfis?.email || ''
    }));

    console.log('Trabalhadores formatados:', trabalhadoresFormatados);
    return trabalhadoresFormatados;

  } catch (error) {
    console.error('Erro na busca de trabalhadores:', error);
    
    // Em caso de erro, retorna array vazio
    // Em produção, você pode querer mostrar uma mensagem de erro específica
    return [];
  }
};

/**
 * Função de fallback que usa dados simulados
 * Útil para desenvolvimento quando o banco ainda não está configurado
 */
export const buscarTrabalhadoresFallback = (servico, localizacao) => {
  console.log('Usando dados simulados como fallback');
  
  // Importa a função original de dados simulados
  const { buscarTrabalhadores } = require('../data/mockData');
  return buscarTrabalhadores(servico, localizacao);
};

