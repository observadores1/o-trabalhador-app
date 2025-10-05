/**
 * @file SalaDeTrabalho.js
 * @description Componente central para ações e extrato final de uma OS. (VERSÃO COM CORREÇÃO FINAL NA EXIBIÇÃO DAS ESTRELAS)
 * @author Jeferson Gnoatto
 * @date 2025-09-30
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import HeaderEstiloTop from '../components/HeaderEstiloTop';
import FormularioAvaliacao from '../components/FormularioAvaliacao';
import './SalaDeTrabalho.css';

const EstrelasDisplay = ({ nota }) => {
  const notaNumerica = parseInt(nota, 10);
  if (isNaN(notaNumerica) || notaNumerica === 0) {
    return <span className="estrelas-display-vazio">N/A</span>;
  }
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
    const [comentarioFinal, setComentarioFinal] = useState('');

    const isFinalizado = os?.status === 'concluida' || os?.status === 'cancelada';

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
        if (!osId || isFinalizado) return;
        const channel = supabase.channel(`sala_trabalho_${osId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `ordem_de_servico_id=eq.${osId}` },
                (payload) => { setMensagens((prevMensagens) => [...prevMensagens, payload.new]); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [osId, isFinalizado]);

    useEffect(() => {
        if (chatBoxRef.current) { chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; }
    }, [mensagens]);

    const handleEnviarMensagem = async (e) => {
        e.preventDefault();
        if (novaMensagem.trim() === '' || !user || !osId || isFinalizado) return;
        const { error } = await supabase.from('mensagens').insert({ ordem_de_servico_id: osId, remetente_id: user.id, conteudo: novaMensagem.trim() });
        if (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Não foi possível enviar a mensagem.');
        } else {
            setNovaMensagem('');
        }
    };

    const handleFinalizarServico = async (dadosAvaliacao = null) => {
        const isContratante = user.id === os.contratante_id;
        const isTrabalhador = user.id === os.trabalhador_id;

        if ((isContratante || isTrabalhador) && !comentarioFinal.trim()) {
            alert(isContratante ? "O comentário da avaliação é obrigatório." : "O relatório de conclusão é obrigatório.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error: rpcError } = await supabase.rpc('finalizar_servico', {
                os_id_param: osId,
                comentario_final: comentarioFinal,
                avaliacao_estrelas_param: dadosAvaliacao
            });

            if (rpcError) throw rpcError;

            alert("Ação realizada com sucesso!");
            setShowConcludeForm(false);
            await carregarDadosTrabalho(false);
            
            if (isContratante) {
                await refreshPendencias(user);
            }

        } catch (err) {
            console.error("Erro ao finalizar serviço:", err);
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
        if (!os) return null;
        const isContratante = user.id === os.contratante_id;

        if ((os.status === 'concluida' && os.avaliado_pelo_contratante) || os.status === 'cancelada') {
            return (
                <div className="extrato-final">
                    <h4>{os.status === 'cancelada' ? 'Serviço Cancelado' : 'Serviço Finalizado'}</h4>
                    {os.status === 'cancelada' && <p><strong>Motivo:</strong> {os.motivo_cancelamento}</p>}
                    
                    {os.status === 'concluida' && (
                        <>
                            {os.comentario_encerramento_trabalhador && <p><strong>Relatório do Prestador:</strong> {os.comentario_encerramento_trabalhador}</p>}
                            {os.avaliacao_texto && <p><strong>Comentário da Avaliação:</strong> {os.avaliacao_texto}</p>}
                            {os.avaliacao_estrelas && (
                                <>
                                    <h4 style={{marginTop: '1rem'}}>Avaliação Detalhada</h4>
                                    <div className="avaliacao-grid">
                                        {/* #### CORREÇÃO FINAL APLICADA AQUI #### */}
                                        {/* Agora, passamos 'nota' (o valor numérico) para o componente EstrelasDisplay, em vez do objeto inteiro. */}
                                        {Object.entries(os.avaliacao_estrelas).map(([quesito, nota]) => (
                                            <div className="quesito-display" key={quesito}>
                                                <span>{quesito.replace(/_/g, ' ')}:</span> 
                                                <EstrelasDisplay nota={nota} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{marginTop: '20px'}}>Voltar ao Início</button>
                </div>
            );
        }

        if (os.status === 'concluida' && isContratante && !os.avaliado_pelo_contratante) {
            return (
                <div className="conclusao-form">
                    <h3>Avaliação Pendente</h3>
                    <p>O prestador de serviços concluiu o serviço. Por favor, deixe seu comentário e avaliação para finalizar.</p>
                    <textarea placeholder="Deixe seu comentário sobre o serviço..." value={comentarioFinal} onChange={(e) => setComentarioFinal(e.target.value)} disabled={isSubmitting} />
                    <FormularioAvaliacao onSubmit={handleFinalizarServico} isSubmitting={isSubmitting} comentarioConclusao={comentarioFinal} isPendente={true} />
                </div>
            );
        }
        
        if (os.status === 'concluida' && !isContratante) {
            return (
                <div>
                    <p>Você concluiu este serviço. Aguardando avaliação do contratante.</p>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{marginTop: '20px'}}>Voltar ao Início</button>
                </div>
            );
        }

        if (showConcludeForm) {
            return (
                <div className="conclusao-form">
                    <h3>{isContratante ? 'Concluir e Avaliar Serviço' : 'Concluir Serviço'}</h3>
                    <textarea
                        placeholder={isContratante ? "Deixe o comentário da sua avaliação..." : "Deixe seu relatório de conclusão ou orientações para o contratante."}
                        value={comentarioFinal}
                        onChange={(e) => setComentarioFinal(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {isContratante ? (
                        <FormularioAvaliacao onSubmit={handleFinalizarServico} isSubmitting={isSubmitting} comentarioConclusao={comentarioFinal} />
                    ) : (
                        <div className="botoes-container">
                            <button onClick={() => handleFinalizarServico()} className="btn btn-success" disabled={isSubmitting || !comentarioFinal.trim()}>
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
                    <textarea placeholder="Justificativa obrigatória para o cancelamento..." value={motivoCancelamento} onChange={(e) => setMotivoCancelamento(e.target.value)} disabled={isSubmitting} />
                    <div className="botoes-container">
                        <button onClick={handleCancelarServico} className="btn btn-danger" disabled={isSubmitting || !motivoCancelamento.trim()}>{isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}</button>
                        <button onClick={() => setShowCancelForm(false)} className="btn btn-secondary" disabled={isSubmitting}>Voltar</button>
                    </div>
                </div>
            );
        }

        if (os.status === 'em_andamento' || os.status === 'aceita') {
            return (
                <div className="botoes-container">
                    <button onClick={() => setShowCancelForm(true)} className="btn btn-danger" disabled={isSubmitting}>Cancelar Serviço</button>
                    <button onClick={() => setShowConcludeForm(true)} className="btn btn-success" disabled={isSubmitting}>Concluir Serviço</button>
                </div>
            );
        }

        return null;
    };

    if (isLoading) return <div className="sala-trabalho-container-interno"><p>Carregando...</p></div>;
    if (error) return <div className="sala-trabalho-container-interno"><p className="error-message">{error}</p></div>;
    if (!os || !contratante || !trabalhador) return <div className="sala-trabalho-container-interno"><p>Não foi possível carregar os dados.</p></div>;

    const detalhes = os.detalhes_adicionais || {};

    return (
        <div className="page-container">
            <HeaderEstiloTop showUserActions={false} />
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
                            {!isFinalizado && <p><strong>Telefone:</strong> {contratante.telefone || 'Não informado'}</p>}
                        </div>
                        <div className="perfil-card">
                            <h2>Prestador de Serviços</h2>
                            <p>{trabalhador.apelido}</p>
                            {!isFinalizado && <p><strong>Telefone:</strong> {trabalhador.telefone || 'Não informado'}</p>}
                        </div>
                    </section>
                    <section className="info-servico">
                        <h2>Detalhes do Serviço</h2>
                        <p><strong>Descrição:</strong> {os.descricao_servico || 'Não informado'}</p>
                        <p><strong>Valor Acordado:</strong> R$ {os.valor_acordado}</p>
                        <p><strong>Habilidade Contratada:</strong> {os.habilidade || 'Não informada'}</p>
                        {os.endereco && <p><strong>Endereço:</strong> {`${os.endereco.rua}, ${os.endereco.numero} - ${os.endereco.bairro}, ${os.endereco.cidade}`}</p>}
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
                                <input type="text" placeholder="Digite sua mensagem..." value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} disabled={isSubmitting} />
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
        </div>
    );
};

export default SalaDeTrabalho;
