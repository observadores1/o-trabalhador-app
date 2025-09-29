/**
 * @file PaginaNovaOS.js
 * @description Página para criação de novas Ordens de Serviço (Ofertas Públicas ou Propostas Diretas).
 * @author Jeferson Gnoatto
 * @date 2025-09-25
 * Louvado seja Cristo, Louvado seja Deus
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabaseClient';
import FormularioOrdemServico from './components/FormularioOrdemServico';
import HeaderEstiloTop from './components/HeaderEstiloTop';
import './PaginaNovaOS.css';

const PaginaNovaOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const trabalhadorId = queryParams.get('trabalhador_id');

  const handleFormSubmit = async (formData) => {
    if (!user) {
      alert("Você precisa estar logado para criar uma ordem de serviço.");
      return;
    }

    const dadosParaSalvar = {
      contratante_id: user.id,
      status: trabalhadorId ? 'pendente' : 'oferta_publica',
      trabalhador_id: trabalhadorId || null,
      habilidade: formData.habilidade,
      titulo_servico: formData.titulo_servico,
      
      // ================== CORREÇÃO APLICADA AQUI ==================
      descricao_servico: formData.descricao_servico, // O nome da coluna foi corrigido
      // =============================================================

      data_inicio_prevista: formData.data_inicio_prevista,
      data_conclusao: formData.data_conclusao || null,
      valor_acordado: formData.valor_proposto || null,
      endereco: {
        rua: formData.endereco.rua,
        numero: formData.endereco.numero,
        bairro: formData.endereco.bairro,
        cidade: formData.endereco.cidade,
        estado: formData.endereco.estado,
      },
      observacoes: formData.observacoes,
      detalhes_adicionais: formData.detalhes_adicionais,
    };

    // A sintaxe .insert([dadosParaSalvar]) é válida, mas .insert(dadosParaSalvar) é mais comum para um único objeto.
    // Ambas funcionam. Vamos manter a sua.
    const { error } = await supabase.from('ordens_de_servico').insert([dadosParaSalvar]);

    if (error) {
      console.error('Erro ao criar Ordem de Serviço:', error);
      alert(`Erro ao criar a oferta: ${error.message}`);
      throw error;
    } else {
      alert('Ordem de Serviço criada com sucesso!');
      navigate('/minhas-os');
    }
  };

  return (
    <div className="page-container">
      <HeaderEstiloTop showUserActions={false} />
      <main className="main-content">
        <div className="pagina-os-main">
          <div className="pagina-os-header">
            <h1>
              {trabalhadorId ? 'Propor Serviço para Profissional' : 'Criar Nova Oferta de Serviço'}
            </h1>
            <p>
              {trabalhadorId 
                ? 'Preencha os detalhes abaixo. O profissional será notificado e poderá aceitar ou recusar sua proposta.'
                : 'Descreva o serviço que você precisa. Sua oferta ficará visível para os trabalhadores da plataforma.'
              }
            </p>
          </div>
          <FormularioOrdemServico 
            trabalhadorId={trabalhadorId}
            onFormSubmit={handleFormSubmit} 
          />
        </div>
      </main>
    </div>
  );
};

export default PaginaNovaOS;
