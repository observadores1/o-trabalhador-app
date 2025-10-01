/**
 * @file MeusTrabalhos.js
 * @description Componente que exibe a lista de trabalhos de um profissional. (VERSÃO COM FILTRO DE STATUS)
 * @author Jeferson Gnoatto
 * @date 2025-09-27
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import HeaderEstiloTop from './HeaderEstiloTop';
import './MeusTrabalhos.css';

const MeusTrabalhos = () => {
    const { user, loading: authLoading } = useAuth();
    const [trabalhos, setTrabalhos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrabalhos = useCallback(async () => {
        if (user) {
            setLoading(true);
            
            // ================== CORREÇÃO APLICADA AQUI ==================
            // Adicionamos um filtro para que a busca NÃO inclua OS com status 'pendente'.
            const { data, error } = await supabase
                .from('ordens_de_servico')
                .select('*')
                .eq('trabalhador_id', user.id)
                .not('status', 'eq', 'pendente') // <-- FILTRO CRÍTICO ADICIONADO
                .order('created_at', { ascending: false });
            // =============================================================

            if (error) {
                console.error('Erro ao buscar trabalhos:', error);
            } else {
                setTrabalhos(data);
            }
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchTrabalhos();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading, fetchTrabalhos]);

    if (loading || authLoading) {
        return (
            <>
                <HeaderEstiloTop showUserActions={false} />
                <div className="meus-trabalhos-container">Carregando trabalhos...</div>
            </>
        );
    }

    return (
        <>
            <HeaderEstiloTop showUserActions={false} />
            <div className="meus-trabalhos-container">
                <div className="meus-trabalhos-header-interno">
                    <h1>Meus Trabalhos</h1>
                </div>
                {trabalhos.length > 0 ? (
                    <div className="os-lista">
                        {trabalhos.map((trabalho) => {
                            const status = (trabalho.status || 'indefinido').toLowerCase().replace(/\s+/g, '_');
                            const isEmAndamento = status === 'em_andamento' || status === 'aceita';
                            const linkDestino = isEmAndamento ? `/trabalho/${trabalho.id}` : `/os/${trabalho.id}`;
                            
                            return (
                                <div key={trabalho.id} className={`os-card status-${status}`}>
                                    <div className="os-card-header">
                                        <h3>{trabalho.titulo_servico || 'Serviço sem Título'}</h3>
                                        <span className={`os-status-badge status-${status}`}>
                                            {status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="os-card-body">
                                        <p>{trabalho.descricao_servico || 'Sem descrição detalhada.'}</p>
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
