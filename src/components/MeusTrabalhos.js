/**
 * @file MeusTrabalhos.js
 * @description Componente que exibe a lista de trabalhos de um profissional.
 * @author Jeferson Gnoatto
 * @date 2025-09-25
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseCliente.js';
import { Link } from 'react-router-dom';
import HeaderEstiloTop from './HeaderEstiloTop';
import './MeusTrabalhos.css';

const MeusTrabalhos = () => {
    // ... (toda a lógica do componente permanece exatamente a mesma)
    const [trabalhos, setTrabalhos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
            } else {
                console.log("Nenhuma sessão encontrada.");
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        if (userId) {
            const fetchTrabalhos = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('ordens_de_servico')
                    .select(`*`)
                    .eq('trabalhador_id', userId);

                if (error) {
                    console.error('Erro ao buscar trabalhos:', error);
                } else {
                    setTrabalhos(data);
                }
                setLoading(false);
            };
            fetchTrabalhos();
        }
    }, [userId]);

    const getStatusClass = (status) => {
        const statusNormalizado = (status || '').toLowerCase().replace(/\s+/g, '_');
        switch (statusNormalizado) {
            case 'em_andamento':
                return 'status-em_andamento';
            case 'oferta_publica':
                return 'status-oferta_publica';
            case 'pendente':
                return 'status-pendente';
            case 'concluido':
            case 'concluída':
                return 'status-concluido';
            case 'cancelado':
            case 'cancelada':
            case 'recusado':
            case 'recusada':
                return 'status-cancelado';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <>
                {/* CORREÇÃO APLICADA AQUI */}
                <HeaderEstiloTop showUserActions={false} />
                <div className="meus-trabalhos-container">Carregando trabalhos...</div>
            </>
        );
    }

    return (
        <>
            {/* CORREÇÃO APLICADA AQUI */}
            <HeaderEstiloTop showUserActions={false} />
            <div className="meus-trabalhos-container">
                <div className="meus-trabalhos-header-interno">
                    <h1>Meus Trabalhos</h1>
                </div>
                {trabalhos.length > 0 ? (
                    <div className="os-lista">
                        {trabalhos.map((trabalho) => {
                            const isEmAndamento = (trabalho.status || '').toLowerCase().includes('andamento');
                            const linkDestino = isEmAndamento 
                                ? `/trabalho/${trabalho.id}` 
                                : `/os/${trabalho.id}`;
                            
                            return (
                                <div key={trabalho.id} className={`os-card ${getStatusClass(trabalho.status)}`}>
                                    <div className="os-card-header">
                                        <h3>{trabalho.habilidade || 'Serviço sem Título'}</h3>
                                        <span className={`os-status-badge ${getStatusClass(trabalho.status)}`}>
                                            {trabalho.status || 'Indefinido'}
                                        </span>
                                    </div>
                                    <div className="os-card-body">
                                        <p>{trabalho.descricao || 'Sem descrição detalhada.'}</p>
                                    </div>
                                    <div className="os-card-actions">
                                        <Link to={linkDestino} className="btn btn-primary">
                                            {isEmAndamento ? 'Acessar Sala' : 'Ver Detalhes'}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>Nenhum trabalho encontrado.</p>
                )}
            </div>
        </>
    );
};

export default MeusTrabalhos;
