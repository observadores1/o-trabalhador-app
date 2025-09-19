// src/components/MeusTrabalhos.js - ATUALIZADO COM HEADER REUTILIZÁVEL

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import HeaderEstiloTop from './HeaderEstiloTop'; // <-- IMPORTAÇÃO
import './MeusTrabalhos.css';

const MeusTrabalhos = () => {
    const { user } = useAuth(); // signOut não é mais necessário aqui
    const navigate = useNavigate();
    const [trabalhos, setTrabalhos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const carregarTrabalhos = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('ordens_de_servico')
                    .select('*')
                    .eq('trabalhador_id', user.id)
                    .order('status', { ascending: false })
                    .order('created_at', { ascending: false });
                if (fetchError) throw fetchError;
                setTrabalhos(data);
            } catch (err) {
                console.error("Erro ao carregar trabalhos:", err);
                setError("Não foi possível carregar seus trabalhos.");
            } finally {
                setIsLoading(false);
            }
        };
        carregarTrabalhos();
    }, [user]);

    const handleNavegarParaOS = (os) => {
        if (os.status === 'em_andamento') {
            navigate(`/trabalho/${os.id}`);
        } else {
            navigate(`/os/${os.id}`);
        }
    };

    const renderConteudo = () => {
        if (isLoading) return <p>Carregando seus trabalhos...</p>;
        if (error) return <p className="error-message">{error}</p>;
        return (
            <div className="trabalhos-list">
                {trabalhos.map(os => (
                    <div key={os.id} className={`trabalho-card status-${os.status}`}>
                        <div className="trabalho-card-header">
                            <h3>{os.titulo_servico}</h3>
                            <span className={`os-status-badge status-${os.status}`}>{os.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="trabalho-card-body">
                            <p><strong>Data do Aceite:</strong> {os.data_aceite ? new Date(os.data_aceite).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Valor Acordado:</strong> R$ {os.valor_acordado}</p>
                        </div>
                        <div className="trabalho-card-footer">
                            <button onClick={() => handleNavegarParaOS(os)} className="btn btn-primary">
                                {os.status === 'em_andamento' ? 'Acessar Sala' : 'Ver Detalhes'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="meus-trabalhos-container">
            {/* SUBSTITUIÇÃO DO HEADER ANTIGO */}
            <HeaderEstiloTop showUserActions={false} />
            <main className="meus-trabalhos-main">
                <div className="meus-trabalhos-header-interno">
                    <h1>Meus Trabalhos</h1>
                    <p>Acompanhe aqui os serviços que você aceitou.</p>
                </div>
                {renderConteudo()}
            </main>
        </div>
    );
};

export default MeusTrabalhos;
