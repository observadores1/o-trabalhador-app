// src/components/SalaDeTrabalho.js - VERSÃO FINAL, COMPLETA E ESTÁVEL
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import HeaderEstiloTop from './HeaderEstiloTop';
import FormularioAvaliacao from './FormularioAvaliacao';
import './SalaDeTrabalho.css';

const EstrelasDisplay = ({ nota }) => {
  const notaNumerica = Number(nota);
  if (!notaNumerica || notaNumerica === 0) return <span className="estrelas-display">N/A</span>;
  return (
    <div className="estrelas-display">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < notaNumerica ? 'preenchida' : ''}>★</span>
      ))}
    </div>
  );
};

const SalaDeTrabalho = () => {
    const { osId } = useParams();
    const { user, refreshPendencias } = useAuth();
    const navigate = useNavigate();
    const [os, setOs] = useState(null);
    const [contratante, setContratante] = useState(null);
    const [trabalhador, setTrabalhador] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const chatBoxRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConcludeForm, setShowConcludeForm] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [motivoCancelamento, setMotivoCancelamento] = useState('');
    const [comentarioConclusao, setComentarioConclusao] = useState('');

    const carregarDadosTrabalho = useCallback(async (showLoading = true) => {
        if (!osId || !user) return;
        if (showLoading) setIsLoading(true);
        try {
            const { data: osData, error: osError } = await supabase.from('ordens_de_servico').select('*').eq('id', osId).single();
            if (osError) throw osError;
            if (user.id !== osData.contratante_id && user.id !== osData.trabalhador_id) {
                throw new Error("Você não tem permissão para acessar esta sala de trabalho.");
            }
            setOs(osData);

            const idsParaBuscar = [osData.contratante_id, osData.trabalhador_id].filter(Boolean);
            if (idsParaBuscar.length > 0) {
                const { data: perfisData, error: perfisError } = await supabase.from('perfis_completos').select('*').in('id', idsParaBuscar);
                if (perfisError) throw perfisError;
                setContratante(perfisData.find(p => p.id === osData.contratante_id));
                setTrabalhador(perfisData.find(p => p.id === osData.trabalhador_id));
            }
            
            const { data: mensagensData, error: mensagensError } = await supabase.from('mensagens').select('*').eq('ordem_de_servico_id', osId).order('created_at', { ascending: true });
            if (mensagensError) throw mensagensError;
            setMensagens(mensagensData);
        } catch (err) {
            console.error("Erro ao carregar dados da sala de trabalho:", err);
            setError(err.message);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [osId, user]);

    useEffect(() => { carregarDadosTrabalho(); }, [carregarDadosTrabalho]);

    useEffect(() => {
        if (!osId || os?.status === 'concluida' || os?.status === 'cancelada') return;
        const channel = supabase.channel(`sala_trabalho_${osId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `ordem_de_servico_id=eq.${osId}` },
                (payload) => { setMensagens((prevMensagens) => [...prevMensagens, payload.new]); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [osId, os?.status]);

    useEffect(() => {
        if (chatBoxRef.current) { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; }
    }, [mensagens]);

    const handleEnviarMensagem = async (e) => {
        e.preventDefault();
        if (novaMensagem.trim() === '' || !user || !osId) return;
        const { error } = await supabase.from('mensagens').insert({ ordem_de_servico_id: osId, remetente_id: user.id, conteudo: novaMensagem.trim() });
        if (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Não foi possível enviar a mensagem.');
        } else {
            setNovaMensagem('');
        }
    };

    const handleFinalizacao = async (dadosAvaliacao = null) => {
        setIsSubmitting(true);
        try {
            const { error: rpcError } = await supabase.rpc('finalizar_servico', {
                os_id_param: osId,
                comentario_final: comentarioConclusao,
                avaliacao_estrelas_param: dadosAvaliacao
            });
            if (rpcError) throw rpcError;

            alert("Operação realizada com sucesso!");
            setShowConcludeForm(false);
            await carregarDadosTrabalho(false);
            await refreshPendencias(user);
        } catch (err) {
            console.error("Erro detalhado ao finalizar o serviço:", err);
            alert(`Ocorreu um erro: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelarServico = async () => {
        if (!motivoCancelamento.trim()) {
            alert("A justificativa para o cancelamento é obrigatória.");
            return;
        }
        if (!window.confirm("Tem certeza que deseja cancelar este serviço? Esta ação não pode ser desfeita.")) return;
        setIsSubmitting(true);
        const { error: rpcError } = await supabase.rpc('cancelar_servico_pela_sala', { os_id_param: osId, motivo_param: motivoCancelamento });
        if (rpcError) {
            alert(`Erro ao cancelar o serviço: ${rpcError.message}`);
        } else {
            alert("Serviço cancelado.");
            setShowCancelForm(false);
            await carregarDadosTrabalho(false);
        }
        setIsSubmitting(false);
    };

    const renderAcoesFinais = () => {
        const isContratante = user.id === contratante?.id;

        if (os?.status === 'concluida' && os.avaliado_pelo_contratante) {
            return (
                <div className="extrato-final">
                    <h4>Serviço Finalizado</h4>
                    {os.comentario_encerramento_trabalhador && <p><strong>Relatório do Prestador de Serviços:</strong> {os.comentario_encerramento_trabalhador}</p>}
                    {os.avaliacao_texto && <p><strong>Comentário da Avaliação:</strong> {os.avaliacao_texto}</p>}
                    {os.avaliacao_estrelas && (
                        <>
                            <h4 style={{marginTop: '1rem'}}>Avaliação Detalhada</h4>
                            <div className="avaliacao-grid">
                                {Object.entries(os.avaliacao_estrelas).map(([quesito, nota]) => (
                                    <div className="quesito-display" key={quesito}><span>{quesito.replace(/_/g, ' ')}:</span> <EstrelasDisplay nota={nota} /></div>
                                ))}
                            </div>
                        </>
                    )}
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{marginTop: '20px'}}>Voltar ao Início</button>
                </div>
            );
        }

        if (os?.status === 'cancelada') {
            return (
                <div>
                    <p className="status-final-info">Serviço cancelado. Motivo: {os.motivo_cancelamento}</p>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{marginTop: '20px'}}>Voltar ao Início</button>
                </div>
            );
        }

        if (os?.status === 'concluida' && isContratante && !os.avaliado_pelo_contratante) {
            return (
                <div className="conclusao-form">
                    <h3>Avaliação Pendente</h3>
                    <p>O prestador de serviços concluiu o serviço. Por favor, deixe seu comentário e avaliação para finalizar.</p>
                    <textarea placeholder="Deixe seu comentário sobre o serviço..." value={comentarioConclusao} onChange={(e) => setComentarioConclusao(e.target.value)} disabled={isSubmitting} />
                    <FormularioAvaliacao onSubmit={handleFinalizacao} isSubmitting={isSubmitting} comentarioConclusao={comentarioConclusao} isPendente={true} />
                </div>
            );
        }

        if (showConcludeForm) {
            return (
                <div className="conclusao-form">
                    <h3>{isContratante ? 'Concluir e Avaliar Serviço' : 'Concluir Serviço'}</h3>
                    <textarea
                        placeholder={isContratante ? "Deixe o comentário da sua avaliação..." : "Deixe seu relatório de conclusão ou orientações para o contratante."}
                        value={comentarioConclusao}
                        onChange={(e) => setComentarioConclusao(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {isContratante && (
                        <FormularioAvaliacao onSubmit={handleFinalizacao} isSubmitting={isSubmitting} comentarioConclusao={comentarioConclusao} />
                    )}
                    {!isContratante && (
                        <div className="botoes-container">
                            <button onClick={() => handleFinalizacao()} className="btn btn-success" disabled={isSubmitting || !comentarioConclusao.trim()}>
                                {isSubmitting ? 'Confirmando...' : 'Confirmar Conclusão'}
                            </button>
                            <button onClick={() => setShowConcludeForm(false)} className="btn btn-secondary" disabled={isSubmitting}>Voltar</button>
                        </div>
                    )}
                </div>
            );
        }

        if (showCancelForm) {
            return (
                <div className="cancelamento-form">
                    <textarea
                        placeholder="Justificativa obrigatória para o cancelamento..."
                        value={motivoCancelamento}
                        onChange={(e) => setMotivoCancelamento(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="botoes-container">
                        <button onClick={handleCancelarServico} className="btn btn-danger" disabled={isSubmitting || !motivoCancelamento.trim()}>
                            {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
                        </button>
                        <button onClick={() => setShowCancelForm(false)} className="btn btn-secondary" disabled={isSubmitting}>
                            Voltar
                        </button>
                    </div>
                </div>
            );
        }

        if (os?.status === 'em_andamento') {
            return (
                <div className="botoes-container">
                    <button onClick={() => setShowConcludeForm(true)} className="btn btn-success" disabled={isSubmitting}>Concluir Serviço</button>
                    <button onClick={() => setShowCancelForm(true)} className="btn btn-danger" disabled={isSubmitting}>Cancelar Serviço</button>
                </div>
            );
        }

        if (os?.status === 'concluida' && !isContratante) {
            return (
                <div>
                    <p>Você concluiu este serviço. Aguardando avaliação do contratante.</p>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{marginTop: '20px'}}>Voltar ao Início</button>
                </div>
            );
        }

        return null;
    };

    const renderConteudoPrincipal = () => {
        if (isLoading) return <div className="sala-trabalho-container-interno"><p>Carregando...</p></div>;
        if (error) return <div className="sala-trabalho-container-interno"><p className="error-message">{error}</p></div>;
        if (!os || !contratante || !trabalhador) return <div className="sala-trabalho-container-interno"><p>Não foi possível carregar os dados.</p></div>;

        const isFinalizado = os.status === 'concluida' || os.status === 'cancelada';
        const detalhes = os.detalhes_adicionais || {};

        return (
            <div className="sala-trabalho-container-interno">
                <div className="sala-trabalho-titulo-container">
                    <h2>{os.titulo_servico}</h2>
                    <span className={`os-status-badge status-${os.status}`}>{os.status.replace(/_/g, ' ')}</span>
                </div>
                <main className="sala-trabalho-main">
                    <section className="info-participantes">
                        <div className="perfil-card">
                            <h2>Contratante</h2>
                            <p>{contratante.apelido}</p>
                            <p><strong>Telefone:</strong> {contratante.telefone || 'Não informado'}</p>
                        </div>
                        <div className="perfil-card">
                            <h2>Prestador de Serviços</h2>
                            <p>{trabalhador.apelido}</p>
                            <p><strong>Telefone:</strong> {trabalhador.telefone || 'Não informado'}</p>
                        </div>
                    </section>
                    <section className="info-servico">
                        <h2>Detalhes do Serviço</h2>
                        <p><strong>Descrição:</strong> {os.descricao_servico || 'Não informado'}</p>
                        <p><strong>Valor Acordado:</strong> R$ {os.valor_acordado}</p>
                        <p><strong>Habilidade Contratada:</strong> {os.habilidade_requerida || 'Não informada'}</p>
                        {os.endereco && (
                            <p><strong>Endereço:</strong> {`${os.endereco.rua}, ${os.endereco.numero} - ${os.endereco.bairro}, ${os.endereco.cidade}`}</p>
                        )}
                        <div className="detalhes-adicionais-sala">
                            <h4>Detalhes Adicionais e Observações</h4>
                            <ul>
                                {detalhes.necessario_transporte && <li>Necessário transporte até o local</li>}
                                {detalhes.necessario_ferramentas && <li>Necessário que o prestador traga ferramentas</li>}
                                {detalhes.necessario_refeicao && <li>Refeição inclusa no local</li>}
                                {detalhes.necessario_ajudante && <li>Será necessário um ajudante</li>}
                                {(!detalhes.necessario_transporte && !detalhes.necessario_ferramentas && !detalhes.necessario_refeicao && !detalhes.necessario_ajudante) && (<li>Nenhum detalhe adicional informado.</li>)}
                            </ul>
                            {os.observacoes ? (<p><strong>Observações:</strong> {os.observacoes}</p>) : (<p><strong>Observações:</strong> Nenhuma observação fornecida.</p>)}
                        </div>
                    </section>
                    <section className="secao-chat">
                        <h2>Chat da Conversa</h2>
                        <div className="chat-box" ref={chatBoxRef}>
                            {mensagens.map(msg => (
                                <div key={msg.id} className={`chat-message ${msg.remetente_id === user.id ? 'minha-mensagem' : 'outra-mensagem'}`}>
                                    <p className="mensagem-conteudo">{msg.conteudo}</p>
                                    <span className="mensagem-timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>
                        {!isFinalizado && (
                            <form className="chat-input-area" onSubmit={handleEnviarMensagem}>
                                <input type="text" placeholder="Digite sua mensagem..." value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} />
                                <button type="submit" className="btn btn-primary" disabled={!novaMensagem.trim()}>Enviar</button>
                            </form>
                        )}
                    </section>
                    <section className="secao-acoes-finais">
                        <h2>Ações Finais</h2>
                        {renderAcoesFinais()}
                    </section>
                </main>
            </div>
        );
    };

    return (
        <div className="sala-trabalho-page-container">
            <HeaderEstiloTop showUserActions={false} />
            {renderConteudoPrincipal()}
        </div>
    );
};

export default SalaDeTrabalho;
