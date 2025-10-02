/**
 * @file PaginaNovaOS.js
 * @description Página para criação de novas Ordens de Serviço. (VERSÃO FINAL SEM AVISOS)
 * @author Jeferson Gnoatto & Manus AI
 * @date 2025-10-02
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './services/supabaseClient';
import FormularioOrdemServico from './components/FormularioOrdemServico';
import HeaderEstiloTop from './components/HeaderEstiloTop';
import ModalPagamentoPix from './components/ModalPagamentoPix';
import './PaginaNovaOS.css';

const PaginaNovaOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, statusMonetizacao, verificarStatusMonetizacao } = useAuth();

  const [showModal, setShowModal] = useState(false);
  // A variável 'formDataParaPagamento' foi removida para eliminar o aviso
  // const [formDataParaPagamento, setFormDataParaPagamento] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const trabalhadorId = queryParams.get('trabalhador_id');

  const handleFormSubmit = async (formData) => {
    if (!user) {
      alert("Você precisa estar logado para criar uma ordem de serviço.");
      return;
    }

    console.log('Tentando submeter OS. Status de permissão (podeCriarOS):', statusMonetizacao.podeCriarOS);

    if (!statusMonetizacao.podeCriarOS) {
      console.log('Usuário bloqueado. Abrindo modal de pagamento...');
      // setFormDataParaPagamento(formData); // Linha removida
      setShowModal(true);
      return;
    }
    
    console.log('Usuário com permissão. Criando OS...');
    const dataInicio = new Date(formData.data_inicio_prevista);
    const dataInicioISO = dataInicio.toISOString();

    const dadosParaSalvar = {
      contratante_id: user.id,
      status: trabalhadorId ? 'pendente' : 'oferta_publica',
      trabalhador_id: trabalhadorId || null,
      titulo_servico: formData.titulo_servico,
      descricao_servico: formData.descricao_servico,
      habilidade: formData.habilidade,
      valor_acordado: formData.valor_proposto || null,
      data_inicio_prevista: dataInicioISO,
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

  const handlePaymentSuccess = async () => {
    setShowModal(false);
    alert('Pagamento recebido! Sua permissão para criar OS foi atualizada.');
    if (user) {
      await verificarStatusMonetizacao(user);
    }
  };

  return (
    <>
      {showModal && (
        <ModalPagamentoPix
          tipoPagamento="taxa_os"
          valor={5.00}
          onClose={() => setShowModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

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
    </>
  );
};

export default PaginaNovaOS;
