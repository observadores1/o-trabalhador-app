// src/PaginaNovaOS.js - VERSÃO COMPLETA E CORRIGIDA

import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabaseClient';
import FormularioOrdemServico from './components/FormularioOrdemServico';
import './PaginaNovaOS.css';

const PaginaNovaOS = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const trabalhadorId = searchParams.get('trabalhador_id');

  const handleCreateOS = async (formData) => {
    if (!user) {
      alert("Você precisa estar logado para criar uma ordem de serviço.");
      return;
    }

    // Monta o objeto final para enviar ao Supabase, incluindo TODOS os campos
    const osParaSalvar = {
      contratante_id: user.id,
      trabalhador_id: trabalhadorId || null,
      habilidade: formData.habilidade,
      titulo_servico: formData.titulo_servico,
      descricao_servico: formData.descricao_servico,
      data_inicio_prevista: formData.data_inicio_prevista,
      data_conclusao: formData.data_conclusao,
      valor_acordado: formData.valor_proposto || null,
      observacoes: formData.observacoes,
      endereco: formData.endereco, // Objeto de endereço completo
      detalhes_adicionais: formData.detalhes_adicionais, // Objeto de detalhes completo
      status: trabalhadorId ? 'pendente' : 'oferta_publica',
    };

    try {
      const { error } = await supabase
        .from('ordens_de_servico')
        .insert([osParaSalvar]);

      if (error) throw error;

      alert('✅ Ordem de Serviço criada com sucesso!');
      navigate('/minhas-os');

    } catch (error) {
      console.error('Erro ao criar Ordem de Serviço:', error);
      alert(`❌ Erro ao criar Ordem de Serviço: ${error.message}`);
    }
  };

  return (
    <div className="pagina-os-container">
      <header className="pagina-os-header">
        <h1>{trabalhadorId ? 'Propor Serviço para Profissional' : 'Criar Nova Oferta de Serviço'}</h1>
        <p>{trabalhadorId ? 'Preencha os detalhes abaixo para enviar uma proposta direta.' : 'Descreva o serviço que você precisa. Sua oferta ficará visível para os trabalhadores.'}</p>
      </header>
      <main className="pagina-os-main">
        <FormularioOrdemServico 
          trabalhadorId={trabalhadorId}
          onOsCriada={handleCreateOS}
        />
      </main>
    </div>
  );
};

export default PaginaNovaOS;
