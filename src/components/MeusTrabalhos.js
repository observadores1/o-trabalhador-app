// src/components/MeusTrabalhos.js - VERSÃO FINAL, COMPLETA E CORRIGIDA
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Usando o AuthContext para obter o usuário
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import HeaderEstiloTop from './HeaderEstiloTop';
import './MeusTrabalhos.css';

const MeusTrabalhos = () => {
    const { user, loading: authLoading } = useAuth(); // Obtendo o usuário e o estado de loading do contexto
    const [trabalhos, setTrabalhos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrabalhos = useCallback(async () => {
        if (user) {
            setLoading(true);
            const { data, error } = await supabase
                .from('ordens_de_servico')
                .select(`*`)
                .eq('trabalhador_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar trabalhos:', error);
            } else {
                setTrabalhos(data);
            }
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Apenas executa a busca se a autenticação não estiver carregando e o usuário existir
        if (!authLoading && user) {
            fetchTrabalhos();
        } else if (!authLoading && !user) {
            // Se não há usuário, não há o que carregar
            setLoading(false);
        }
    }, [user, authLoading, fetchTrabalhos]);

    // O estado de carregamento agora considera tanto o auth quanto a busca local
    if (loading || authLoading) {
        return (
            <>
                <HeaderEstiloTop showUserActions={true} />
                <div className="meus-trabalhos-container">Carregando trabalhos...</div>
            </>
        );
    }

    return (
        <>
            <HeaderEstiloTop showUserActions={true} />
            <div className="meus-trabalhos-container">
                <div className="meus-trabalhos-header-interno">
                    <h1>Meus Trabalhos</h1>
                </div>
                {trabalhos.length > 0 ? (
                    <div className="os-lista">
                        {trabalhos.map((trabalho) => {
                            const status = (trabalho.status || 'indefinido').toLowerCase().replace(/\s+/g, '_');
                            const isEmAndamento = status === 'em_andamento' || status === 'aceita';
                            const linkDestino = isEmAndamento 
                                ? `/trabalho/${trabalho.id}` 
                                : `/os/${trabalho.id}`;
                            
                            return (
                                // Usando o status direto do banco para gerar a classe
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
