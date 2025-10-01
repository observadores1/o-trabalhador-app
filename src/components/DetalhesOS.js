import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import HeaderEstiloTop from './HeaderEstiloTop'; // Mantendo seu import original
import EstrelasDisplay from './EstrelasDisplay';
import './DetalhesOS.css';



const formatarDataParaExibicao = (dataString) => {
  if (!dataString) return 'Não informada';
  const data = new Date(dataString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
};

const DetalhesOS = () => {
  const { osId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ordemDeServico, setOrdemDeServico] = useState(null);
  const [nomesEnvolvidos, setNomesEnvolvidos] = useState({ contratante: '', trabalhador: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exibirCampoCancelamento, setExibirCampoCancelamento] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  const carregarDetalhesOS = useCallback(async () => {
    if (!osId || !user) return;
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase.from('ordens_de_servico').select(`*`).eq('id', osId).single();
      if (fetchError) throw fetchError;

      if (data) {
        setOrdemDeServico(data);
        const idsParaBuscar = [data.contratante_id, data.trabalhador_id].filter(Boolean);
        
        if (idsParaBuscar.length > 0) {
            const { data: perfisData, error: perfisError } = await supabase.from('perfis').select('id, apelido').in('id', idsParaBuscar);
            if (perfisError) throw perfisError;
            
            const nomes = {};
            perfisData.forEach(perfil => {
                if (perfil.id === data.contratante_id) nomes.contratante = perfil.apelido;
                if (perfil.id === data.trabalhador_id) nomes.trabalhador = perfil.apelido;
            });
            setNomesEnvolvidos(nomes);
        }
      } else {
        throw new Error("Ordem de Serviço não encontrada ou você não tem permissão para vê-la.");
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da OS:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [osId, user]);

  useEffect(() => {
    carregarDetalhesOS();
  }, [carregarDetalhesOS]);

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
    setIsSubmitting(false);
  };

  const handleCancelarClick = async () => {
    if (!motivoCancelamento.trim()) {
      alert('Por favor, preencha a justificativa para o cancelamento.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja cancelar esta Ordem de Serviço? Esta ação não pode ser desfeita.')) return;
    
    setIsSubmitting(true);
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

  const renderAcoes = () => {
    if (!ordemDeServico || !user) return null;

    const { status, contratante_id, trabalhador_id } = ordemDeServico;
    const isContratante = user.id === contratante_id;
    const isTrabalhadorAlvo = user.id === trabalhador_id;
    const isVisitante = !isContratante && !isTrabalhadorAlvo;

    if (isContratante && (status === 'oferta_publica' || status === 'pendente')) {
      return (
        <div className="botoes-container">
          <button onClick={() => navigate(`/os/${osId}/editar`)} className="btn btn-secondary" disabled={isSubmitting}>Editar</button>
          {!exibirCampoCancelamento && <button onClick={() => setExibirCampoCancelamento(true)} className="btn btn-danger" disabled={isSubmitting}>Cancelar OS</button>}
        </div>
      );
    }

    if (isTrabalhadorAlvo && status === 'pendente') {
      return (
        <div className="botoes-container">
          <button onClick={handleAceitarClick} className="btn btn-success" disabled={isSubmitting}>Aceitar Proposta</button>
          <button onClick={handleNegarClick} className="btn btn-danger" disabled={isSubmitting}>Rejeitar Proposta</button>
        </div>
      );
    }

    if (isVisitante && status === 'oferta_publica') {
      return (
        <div className="botoes-container">
          <button onClick={handleAceitarClick} className="btn btn-success" disabled={isSubmitting}>Aceitar Trabalho</button>
        </div>
      );
    }

    if ((isContratante || isTrabalhadorAlvo) && (status === 'aceita' || status === 'em_andamento')) {
      return (
        <div className="botoes-container">
          <button onClick={() => navigate(`/trabalho/${osId}`)} className="btn btn-primary">Ir para Sala de Trabalho</button>
        </div>
      );
    }

    if (isContratante && status === 'concluida' && !ordemDeServico.avaliado_pelo_contratante) {
        return (
          <div className="botoes-container">
            <p>Este serviço foi concluído pelo prestador. Sua avaliação está pendente.</p>
            <button onClick={() => navigate(`/trabalho/${osId}`)} className="btn btn-warning">Avaliar Agora</button>
          </div>
        );
    }

    return <p>Não há mais ações disponíveis para este serviço.</p>;
  };

  const renderConteudo = () => {
    if (isLoading) return <div className="detalhes-os-container"><p>Carregando detalhes...</p></div>;
    if (error) return <div className="detalhes-os-container"><p className="error-message">{error}</p></div>;
    if (!ordemDeServico) return <div className="detalhes-os-container"><p>Ordem de Serviço não encontrada.</p></div>;

    const { status, detalhes_adicionais, observacoes, endereco } = ordemDeServico;
    const detalhes = detalhes_adicionais || {};

    return (
      <main className="main-content">
        <div className="detalhes-os-container">
          <header className="detalhes-os-header">
            <h1>{ordemDeServico.titulo_servico || 'Detalhes da Ordem de Serviço'}</h1>
            <span className={`os-status-badge status-${status}`}>{status.replace(/_/g, ' ')}</span>
          </header>

          {ordemDeServico.avaliado_pelo_contratante && (
              <div className="detalhes-os-section full-width">
                <h2>Avaliação Realizada</h2>
                {ordemDeServico.avaliacao_texto && <p><strong>Comentário da Avaliação:</strong> {ordemDeServico.avaliacao_texto}</p>}
                {ordemDeServico.avaliacao_estrelas && (
                  <div className="avaliacao-grid">
                    {/* #################### A ÚNICA MUDANÇA ESTÁ AQUI #################### */}
                    {Object.entries(ordemDeServico.avaliacao_estrelas).map(([quesito, nota]) => (
                      <div className="quesito-display" key={quesito}>
                        <span>{quesito.replace(/_/g, ' ')}:</span>
                        <EstrelasDisplay nota={parseInt(nota, 10)} /> {/* Garantindo que a nota seja um número inteiro */}
                      </div>
                    ))}
                    {/* ################################################################### */}
                  </div>
                )}
              </div>
          )}

          <div className="detalhes-os-grid">
            <div className="detalhes-os-section">
              <h2>Serviço Solicitado</h2>
              <p><strong>Habilidade Principal:</strong> {ordemDeServico.habilidade || 'Não informada'}</p>
              <p><strong>Descrição:</strong> {ordemDeServico.descricao_servico}</p>
              <p><strong>Valor Acordado:</strong> R$ {ordemDeServico.valor_acordado || 'A combinar'}</p>
              <p><strong>Início Previsto:</strong> {formatarDataParaExibicao(ordemDeServico.data_inicio_prevista)}</p>
              {ordemDeServico.data_conclusao && <p><strong>Concluído em:</strong> {formatarDataParaExibicao(ordemDeServico.data_conclusao)}</p>}
              {endereco && (
                <>
                  <p><strong>Endereço do Serviço:</strong></p>
                  <div className="endereco-detalhes">
                    {`${endereco.rua || 'Rua não informada'}, ${endereco.numero || 's/n'} - ${endereco.bairro || 'Bairro não informado'}, ${endereco.cidade || 'Cidade não informada'} - ${endereco.estado || 'UF'}`}
                  </div>
                </>
              )}
            </div>
            <div className="detalhes-os-section">
              <h2>Envolvidos</h2>
              <p><strong>Contratante:</strong> {nomesEnvolvidos.contratante}</p>
              <p><strong>Prestador de Serviços:</strong> {nomesEnvolvidos.trabalhador || 'Aguardando aceite'}</p>
            </div>
            <div className="detalhes-os-section full-width">
              <h2>Detalhes Adicionais e Observações</h2>
              <ul>
                {detalhes.necessario_transporte && <li>Necessário transporte até o local</li>}
                {detalhes.necessario_ferramentas && <li>Necessário que o prestador traga ferramentas</li>}
                {detalhes.necessario_refeicao && <li>Refeição inclusa no local</li>}
                {detalhes.necessario_ajudante && <li>Será necessário um ajudante</li>}
                {(!detalhes.necessario_transporte && !detalhes.necessario_ferramentas && !detalhes.necessario_refeicao && !detalhes.necessario_ajudante) && (<li>Nenhum detalhe adicional informado.</li>)}
              </ul>
              {observacoes ? (<p><strong>Observações:</strong> {observacoes}</p>) : (<p><strong>Observações:</strong> Nenhuma observação fornecida.</p>)}
            </div>
          </div>

          <div className="detalhes-os-actions">
            <h2>Ações</h2>
            {renderAcoes()}
            {exibirCampoCancelamento && (
              <div className="cancelamento-form">
                <textarea
                  placeholder="Justificativa obrigatória para o cancelamento..."
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                />
                <div className="botoes-container">
                  <button onClick={handleCancelarClick} className="btn btn-danger" disabled={isSubmitting || !motivoCancelamento.trim()}>Confirmar Cancelamento</button>
                  <button onClick={() => setExibirCampoCancelamento(false)} className="btn btn-secondary" disabled={isSubmitting}>Voltar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  };

  return (
    // Mantendo a estrutura JSX correta que você já tinha
    <div className="page-container">
      <HeaderEstiloTop showUserActions={false} />
      {renderConteudo()}
    </div>
  );
};

export default DetalhesOS;