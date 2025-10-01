/**
 * @file PaginaNovaOS.js
 * @description Página para criação de novas Ordens de Serviço. (VERSÃO COM CORREÇÃO DE FUSO HORÁRIO)
 * @author Jeferson Gnoatto & Manus AI
 * @date 2025-09-27
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

    // ================== CORREÇÃO DE FUSO HORÁRIO APLICADA AQUI ==================
    // O input 'datetime-local' retorna uma string como "2025-10-10T00:50".
    // Criamos um objeto Date a partir dela. O JS assume que é no fuso horário local.
    const dataInicio = new Date(formData.data_inicio_prevista);
    
    // Convertemos para uma string no formato ISO 8601. 
    // Ex: "2025-10-10T03:50:00.000Z". Esta string contém a informação do fuso UTC.
    const dataInicioISO = dataInicio.toISOString();
    // ==========================================================================

    const dadosParaSalvar = {
      contratante_id: user.id,
      status: trabalhadorId ? 'pendente' : 'oferta_publica',
      trabalhador_id: trabalhadorId || null,
      titulo_servico: formData.titulo_servico,
      descricao_servico: formData.descricao_servico,
      habilidade: formData.habilidade,
      valor_acordado: formData.valor_proposto,
      
      data_inicio_prevista: dataInicioISO, // Enviamos a data no formato ISO correto

      data_conclusao: formData.data_conclusao || null,
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
