/**
 * @file DetalhesOS.js
 * @description Exibe os detalhes completos e ações para uma Ordem de Serviço.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import AvaliacaoEstrelas from './AvaliacaoEstrelas';
import HeaderEstiloTop from './HeaderEstiloTop'; // <-- 1. IMPORTAÇÃO DO ESTILO TOP
import './DetalhesOS.css';

const DetalhesOS = () => {
  const { osId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Seus estados originais, todos preservados
  const [ordemDeServico, setOrdemDeServico] = useState(null);
  const [nomesEnvolvidos, setNomesEnvolvidos] = useState({ contratante: '', trabalhador: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exibirCampoCancelamento, setExibirCampoCancelamento] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sua função de carregar detalhes, preservada
  const carregarDetalhesOS = useCallback(async () => {
    if (!osId || !user) return;
    try {
      const { data, error: fetchError } = await supabase.from('ordens_de_servico').select(`*`).eq('id', osId).single();
      if (fetchError) throw fetchError;

      if (data && (data.contratante_id === user.id || data.trabalhador_id === user.id || data.status === 'oferta_publica')) {
        setOrdemDeServico(data);
        const idsParaBuscar = [data.contratante_id];
        if (data.trabalhador_id) idsParaBuscar.push(data.trabalhador_id);
        
        const { data: perfisData, error: perfisError } = await supabase.from('perfis').select('id, apelido').in('id', idsParaBuscar);
        if (perfisError) throw perfisError;
        
        const nomes = {};
        perfisData.forEach(perfil => {
          if (perfil.id === data.contratante_id) nomes.contratante = perfil.apelido;
          if (perfil.id === data.trabalhador_id) nomes.trabalhador = perfil.apelido;
        });
        setNomesEnvolvidos(nomes);
      } else {
        throw new Error("Você não tem permissão para ver esta Ordem de Serviço.");
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da OS:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [osId, user]);

  // Seu useEffect, preservado
  useEffect(() => {
    setIsLoading(true);
    carregarDetalhesOS();
  }, [carregarDetalhesOS]);

  // Suas variáveis de controle, todas preservadas
  const isContratante = user && ordemDeServico && user.id === ordemDeServico.contratante_id;
  const isTrabalhador = user && ordemDeServico && user.id === ordemDeServico.trabalhador_id;
  const isVisitante = user && !isContratante && !isTrabalhador;
  const status = ordemDeServico?.status;

  const podeEditar = isContratante && (status === 'oferta_publica' || status === 'pendente');
  const podeConcluir = (isContratante || isTrabalhador) && (status === 'aceita' || status === 'em_andamento');
  const podeCancelar = (isContratante && (status === 'oferta_publica' || status === 'pendente')) || ((isContratante || isTrabalhador) && (status === 'aceita' || status === 'em_andamento'));
  const podeAvaliar = isContratante && status === 'concluida' && !ordemDeServico?.avaliacao_feita; // Usando o campo correto
  const podeAceitarOfertaPublica = isVisitante && status === 'oferta_publica';
  const podeResponderPropostaDireta = isTrabalhador && status === 'pendente';

  // Suas funções handle, todas preservadas
  const handleEditarClick = () => navigate(`/os/${ordemDeServico.id}/editar`);

  const handleAceitarClick = async () => {
    if (!window.confirm('Tem certeza que deseja aceitar este serviço?')) return;
    setIsSubmitting(true);
    const { error: rpcError } = await supabase.rpc('aceitar_proposta', { 
      os_id_param: osId,
      trabalhador_id_param: user.id
    });
    if (rpcError) {
      alert(`Erro ao aceitar a proposta: ${rpcError.message}`);
      setIsSubmitting(false);
    } else {
      alert('Proposta aceita com sucesso! Você será redirecionado para a Sala de Trabalho.');
      navigate(`/trabalho/${osId}`); 
    }
  };

  const handleNegarClick = async () => {
    if (!window.confirm('Tem certeza que deseja negar esta proposta? Ela será removida de suas oportunidades.')) return;
    setIsSubmitting(true);
    const { error: rpcError } = await supabase.rpc('negar_proposta', { os_id_param: osId });
    if (rpcError) {
      alert(`Erro ao negar a proposta: ${rpcError.message}`);
    } else {
      alert('Proposta negada.');
      navigate('/oportunidades');
    }
  };

  const handleConcluirClick = async () => {
    // Ação correta é navegar para a sala de trabalho para iniciar o processo de conclusão
    navigate(`/trabalho/${osId}`);
  };

  const handleCancelarClick = async () => {
    if (!motivoCancelamento.trim()) {
      alert('Por favor, preencha a justificativa para o cancelamento.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja cancelar esta Ordem de Serviço? Esta ação não pode ser desfeita.')) return;
    
    setIsSubmitting(true);
    // Usando a RPC correta que definimos para a sala de trabalho
    const { error: rpcError } = await supabase.rpc('cancelar_servico_pela_sala', { 
      os_id_param: osId, 
      motivo_param: motivoCancelamento 
    });

    if (rpcError) {
      alert(`Erro ao cancelar OS: ${rpcError.message}`);
    } else {
      alert('Serviço cancelado com sucesso.');
      setExibirCampoCancelamento(false);
      await carregarDetalhesOS();
    }
    setIsSubmitting(false);
  };

  const handleAvaliar = async (dadosAvaliacao) => {
    // Esta função agora deve ser chamada de dentro da SalaDeTrabalho,
    // mas a mantemos aqui para o caso de um fluxo de avaliação separado no futuro.
    setIsSubmitting(true);
    const { error: rpcError } = await supabase.rpc('avaliar_servico_concluido', {
      os_id_param: osId,
      avaliacoes: dadosAvaliacao
    });

    if (rpcError) {
      alert(`Erro ao enviar avaliação: ${rpcError.message}`);
      setIsSubmitting(false);
      return Promise.reject(rpcError);
    } else {
      alert('Avaliação enviada com sucesso!');
      await carregarDetalhesOS();
      setIsSubmitting(false);
      return Promise.resolve();
    }
  };

  // Função para renderizar o conteúdo principal, para organizar o JSX
  const renderConteudo = () => {
    if (isLoading) return <div className="detalhes-os-container"><p>Carregando detalhes...</p></div>;
    if (error) return <div className="detalhes-os-container"><p className="error-message">{error}</p></div>;
    if (!ordemDeServico) return <div className="detalhes-os-container"><p>Ordem de Serviço não encontrada.</p></div>;

    const detalhes = ordemDeServico.detalhes_adicionais || {};

    return (
      <main className="main-content">
        <div className="detalhes-os-container">
          <header className="detalhes-os-header">
            <h1>{ordemDeServico.titulo_servico || 'Detalhes da Ordem de Serviço'}</h1>
            <span className={`os-status-badge status-${status}`}>{status.replace(/_/g, ' ')}</span>
          </header>

          {status === 'cancelada' && ordemDeServico.motivo_cancelamento && (
            <div className="detalhes-os-section-cancelada">
              <h2>Serviço Cancelado</h2>
              <p><strong>Motivo:</strong> {ordemDeServico.motivo_cancelamento}</p>
            </div>
          )}

          <div className="detalhes-os-grid">
            <div className="detalhes-os-section">
              <h2>Serviço Solicitado</h2>
              <p><strong>Habilidade Principal:</strong> {ordemDeServico.habilidade_requerida}</p>
              <p><strong>Descrição:</strong> {ordemDeServico.descricao_servico}</p>
              <p><strong>Valor Acordado:</strong> R$ {ordemDeServico.valor_acordado || 'A combinar'}</p>
              <p><strong>Início Previsto:</strong> {new Date(ordemDeServico.data_inicio_prevista).toLocaleString()}</p>
              <p><strong>Término Previsto:</strong> {new Date(ordemDeServico.data_conclusao).toLocaleString()}</p>
              {ordemDeServico.endereco && (
                <><p><strong>Endereço do Serviço:</strong></p><div className="endereco-detalhes">{`${ordemDeServico.endereco.rua} - ${ordemDeServico.endereco.numero}, ${ordemDeServico.endereco.bairro}, ${ordemDeServico.endereco.cidade} - ${ordemDeServico.endereco.estado}`}</div></>
              )}
            </div>
            <div className="detalhes-os-section">
              <h2>Envolvidos</h2>
              <p><strong>Contratante:</strong> {nomesEnvolvidos.contratante}</p>
              <p><strong>Trabalhador:</strong> {nomesEnvolvidos.trabalhador || 'Aguardando aceite'}</p>
            </div>
            <div className="detalhes-os-section full-width">
              <h2>Detalhes Adicionais e Observações</h2>
              <ul>
                {detalhes.necessario_transporte && <li>Necessário transporte até o local</li>}
                {detalhes.necessario_ferramentas && <li>Necessário que o trabalhador traga ferramentas</li>}
                {detalhes.necessario_refeicao && <li>Refeição inclusa no local</li>}
                {detalhes.necessario_ajudante && <li>Será necessário um ajudante</li>}
                {!detalhes.necessario_transporte && !detalhes.necessario_ferramentas && !detalhes.necessario_refeicao && !detalhes.necessario_ajudante && (<li>Nenhum detalhe adicional informado.</li>)}
              </ul>
              {ordemDeServico.observacoes ? (<p><strong>Observações:</strong> {ordemDeServico.observacoes}</p>) : (<p><strong>Observações:</strong> Nenhuma observação fornecida.</p>)}
            </div>
          </div>

          <div className="detalhes-os-actions">
            <h2>Ações</h2>
            <div className="botoes-container">
              {podeAceitarOfertaPublica && <button onClick={handleAceitarClick} className="btn btn-success" disabled={isSubmitting}>{isSubmitting ? 'Processando...' : 'Aceitar Trabalho'}</button>}
              
              {podeResponderPropostaDireta && (
                <>
                  <button onClick={handleAceitarClick} className="btn btn-success" disabled={isSubmitting}>{isSubmitting ? 'Aceitando...' : 'Aceitar Proposta'}</button>
                  <button onClick={handleNegarClick} className="btn btn-danger" disabled={isSubmitting}>{isSubmitting ? 'Negando...' : 'Negar Proposta'}</button>
                </>
              )}
              
              {podeEditar && <button onClick={handleEditarClick} className="btn btn-secondary" disabled={isSubmitting}>Editar</button>}
              {podeConcluir && <button onClick={handleConcluirClick} className="btn btn-success" disabled={isSubmitting}>{isSubmitting ? 'Processando...' : 'Concluir Serviço'}</button>}
              {podeCancelar && !exibirCampoCancelamento && <button onClick={() => setExibirCampoCancelamento(true)} className="btn btn-danger" disabled={isSubmitting}>Cancelar OS</button>}
            </div>

            {exibirCampoCancelamento && (
              <div className="cancelamento-form">
                <textarea
                  placeholder="Justificativa obrigatória para o cancelamento..."
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                />
                <div className="botoes-container">
                  <button onClick={handleCancelarClick} className="btn btn-danger" disabled={isSubmitting || !motivoCancelamento.trim()}>{isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}</button>
                  <button onClick={() => setExibirCampoCancelamento(false)} className="btn btn-secondary" disabled={isSubmitting}>Voltar</button>
                </div>
              </div>
            )}

            {podeAvaliar && <AvaliacaoEstrelas onAvaliar={handleAvaliar} />}
            
            {ordemDeServico.avaliacao_feita && (
              <div className="avaliacao-realizada">
                <h4>Avaliação Realizada</h4>
                <p>Você já avaliou este serviço. Obrigado!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  };

  // O return principal agora inclui o HeaderEstiloTop e o container da página
  return (
    <div className="page-container">
      <HeaderEstiloTop showUserActions={false} />
      {renderConteudo()}
    </div>
  );
};

export default DetalhesOS;
