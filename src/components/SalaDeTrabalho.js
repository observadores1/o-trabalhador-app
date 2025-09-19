// src/components/SalaDeTrabalho.js - VERSÃO COMPLETA E CORRIGIDA COM FLUXO DE AVALIAÇÃO PENDENTE

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import HeaderEstiloTop from './HeaderEstiloTop';
import FormularioAvaliacao from './FormularioAvaliacao';
import './SalaDeTrabalho.css';

const SalaDeTrabalho = () => {
    const { osId } = useParams();
    const { user } = useAuth();

    const [os, setOs] = useState(null);
    const [contratante, setContratante] = useState(null);
    const [trabalhador, setTrabalhador] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const chatBoxRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [motivoCancelamento, setMotivoCancelamento] = useState('');
    const [showConcludeForm, setShowConcludeForm] = useState(false);
    const [comentarioConclusao, setComentarioConclusao] = useState('');

    const carregarDadosTrabalho = useCallback(async (showLoading = true) => {
        if (!osId || !user) return;
        if (showLoading) setIsLoading(true);
        try {
            const { data: osData, error: osError } = await supabase.from('ordens_de_servico').select('*').eq('id', osId).single();
            if (osError) throw osError;
            if (!osData) throw new Error("Ordem de Serviço não encontrada.");
            if (user.id !== osData.contratante_id && user.id !== osData.trabalhador_id) {
                throw new Error("Você não tem permissão para acessar esta sala de trabalho.");
            }
            setOs(osData);
            if (!contratante || !trabalhador) {
                const idsParaBuscar = [osData.contratante_id, osData.trabalhador_id];
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
    }, [osId, user, contratante, trabalhador]);

    useEffect(() => { carregarDadosTrabalho(); }, [carregarDadosTrabalho]);

    useEffect(() => {
        if (!osId) return;
        const channel = supabase.channel(`sala_trabalho_${osId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `ordem_de_servico_id=eq.${osId}` },
                (payload) => { setMensagens((prevMensagens) => [...prevMensagens, payload.new]); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [osId]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
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

    const handleConcluirServico = async (dadosAvaliacao = null) => {
        if (!comentarioConclusao.trim()) {
            alert("O comentário de conclusão é obrigatório.");
            return;
        }
        setIsSubmitting(true);
        let rpcError = null;
        if (user.id === contratante.id) {
            if (!dadosAvaliacao) {
                alert("Erro: Dados da avaliação não encontrados.");
                setIsSubmitting(false);
                return;
            }
            const { error } = await supabase.rpc('concluir_e_avaliar_servico', {
                os_id_param: osId,
                comentario_param: comentarioConclusao,
                avaliacoes: dadosAvaliacao
            });
            rpcError = error;
        } else {
            const { error } = await supabase.rpc('concluir_servico_pelo_trabalhador', {
                os_id_param: osId,
                comentario_param: comentarioConclusao
            });
            rpcError = error;
        }
        if (rpcError) {
            alert(`Erro ao concluir o serviço: ${rpcError.message}`);
        } else {
            alert("Serviço concluído com sucesso!");
            setShowConcludeForm(false);
            await carregarDadosTrabalho(false);
        }
        setIsSubmitting(false);
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

    // --- NOVA FUNÇÃO PARA AVALIAÇÃO PÓS-CONCLUSÃO ---
    const handleAvaliarServicoConcluido = async (dadosAvaliacao) => {
        if (!dadosAvaliacao) {
            alert("Erro: Dados da avaliação não encontrados.");
            return;
        }
        setIsSubmitting(true);
        const { error } = await supabase.rpc('avaliar_servico_concluido', {
            os_id_param: osId,
            avaliacoes: dadosAvaliacao
        });
        if (error) {
            alert(`Erro ao enviar avaliação: ${error.message}`);
        } else {
            alert("Avaliação enviada com sucesso! Obrigado por sua contribuição.");
            await carregarDadosTrabalho(false);
        }
        setIsSubmitting(false);
    };

    const renderAcoesFinais = () => {
        const isContratante = user.id === contratante?.id;

        // --- LÓGICA DE AVALIAÇÃO PENDENTE (CENÁRIO DO POP-UP) ---
        const avaliacaoPendente = os?.status === 'concluida' && isContratante && !os.avaliado_pelo_contratante;
        if (avaliacaoPendente) {
            return (
                <div className="conclusao-form">
                    <h3>Avaliação Pendente</h3>
                    <p>Este serviço foi concluído pelo trabalhador. Por favor, deixe sua avaliação para finalizar o processo e poder criar novas ofertas.</p>
                    <FormularioAvaliacao 
                        onSubmit={handleAvaliarServicoConcluido} 
                        isSubmitting={isSubmitting}
                        isPendente={true} // Prop para indicar que é uma avaliação pendente
                    />
                </div>
            );
        }

        if (showConcludeForm) {
            return (
                <div className="conclusao-form">
                    <h3>Concluir Serviço</h3>
                    <textarea
                        placeholder="Descreva brevemente o que foi feito para concluir o serviço. Este comentário será visível para a outra parte."
                        value={comentarioConclusao}
                        onChange={(e) => setComentarioConclusao(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {isContratante && (
                        <FormularioAvaliacao 
                            onSubmit={(dadosAvaliacao) => handleConcluirServico(dadosAvaliacao)} 
                            isSubmitting={isSubmitting}
                            comentarioConclusao={comentarioConclusao}
                        />
                    )}
                    {!isContratante && (
                        <div className="botoes-container">
                            <button onClick={() => handleConcluirServico()} className="btn btn-success" disabled={isSubmitting || !comentarioConclusao.trim()}>
                                {isSubmitting ? 'Confirmando...' : 'Confirmar Conclusão'}
                            </button>
                            <button onClick={() => setShowConcludeForm(false)} className="btn btn-secondary" disabled={isSubmitting}>
                                Voltar
                            </button>
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
                    <button onClick={() => setShowConcludeForm(true)} className="btn btn-success" disabled={isSubmitting}>
                        Concluir Serviço
                    </button>
                    <button onClick={() => setShowCancelForm(true)} className="btn btn-danger" disabled={isSubmitting}>
                        Cancelar Serviço
                    </button>
                </div>
            );
        }

        if (os?.status === 'concluida') {
            return <p className="status-final-info">Serviço concluído em {new Date(os.data_conclusao_efetiva).toLocaleString()}.</p>;
        }
        if (os?.status === 'cancelada') {
            return <p className="status-final-info">Serviço cancelado. Motivo: {os.motivo_cancelamento}</p>;
        }

        return null;
    };

    const renderConteudoPrincipal = () => {
        if (isLoading) return <div className="sala-trabalho-container-interno"><p>Carregando...</p></div>;
        if (error) return <div className="sala-trabalho-container-interno"><p className="error-message">{error}</p></div>;
        if (!os || !contratante || !trabalhador) return <div className="sala-trabalho-container-interno"><p>Não foi possível carregar os dados.</p></div>;

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
                            <h2>Trabalhador</h2>
                            <p>{trabalhador.apelido}</p>
                            <p><strong>Telefone:</strong> {trabalhador.telefone || 'Não informado'}</p>
                        </div>
                    </section>
                    <section className="info-servico">
                        <h2>Detalhes do Serviço</h2>
                        <p><strong>Valor Acordado:</strong> R$ {os.valor_acordado}</p>
                        <p><strong>Habilidade Contratada:</strong> {os.habilidade_requerida}</p>
                        {os.especificacoes_habilidades && os.especificacoes_habilidades.length > 0 && (
                            <p><strong>Especificações:</strong> {os.especificacoes_habilidades.join(', ')}</p>
                        )}
                        <p><strong>Endereço:</strong> {`${os.endereco.rua}, ${os.endereco.numero} - ${os.endereco.bairro}, ${os.endereco.cidade}`}</p>
                        <p><strong>Início Previsto:</strong> {new Date(os.data_inicio_prevista).toLocaleString()}</p>
                    </section>
                    <section className="secao-chat">
                        <h2>Chat da Conversa</h2>
                        <div className="chat-box" ref={chatBoxRef}>
                            {mensagens.length === 0 ? (
                                <p className="placeholder-chat">Nenhuma mensagem ainda. Seja o primeiro a dizer olá!</p>
                            ) : (
                                mensagens.map(msg => (
                                    <div key={msg.id} className={`chat-message ${msg.remetente_id === user.id ? 'minha-mensagem' : 'outra-mensagem'}`}>
                                        <p className="mensagem-conteudo">{msg.conteudo}</p>
                                        <span className="mensagem-timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <form className="chat-input-area" onSubmit={handleEnviarMensagem}>
                            <input type="text" placeholder="Digite sua mensagem..." value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} />
                            <button type="submit" className="btn btn-primary" disabled={!novaMensagem.trim()}>Enviar</button>
                        </form>
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
