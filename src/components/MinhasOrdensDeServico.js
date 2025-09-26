// src/components/MinhasOrdensDeServico.js - ATUALIZADO COM HEADER REUTILIZÁVEL

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import HeaderEstiloTop from './HeaderEstiloTop'; // <-- IMPORTAÇÃO
import './MinhasOrdensDeServico.css';

const MinhasOrdensDeServico = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarOrdens = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ordens_de_servico')
          .select('id, created_at, titulo_servico, status, trabalhador_id')
          .eq('contratante_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOrdens(data || []);
      } catch (error) {
        console.error("Erro ao carregar ordens de serviço:", error);
        alert("Não foi possível carregar suas ordens de serviço.");
      } finally {
        setIsLoading(false);
      }
    };
    carregarOrdens();
  }, [user]);

  const handleNavegarParaOS = (os) => {
    if (os.status === 'em_andamento') {
      navigate(`/trabalho/${os.id}`);
    } else {
      navigate(`/os/${os.id}`);
    }
  };

  const renderListaOS = () => {
    if (isLoading) return <p>Carregando suas ordens de serviço...</p>;
    if (ordens.length === 0) return <p>Você ainda não criou nenhuma ordem de serviço.</p>;
    return (
      <div className="os-lista">
        {ordens.map((os) => (
          <div key={os.id} className={`os-card status-${os.status}`}>
            <div className="os-card-header">
              <h3>{os.titulo_servico}</h3>
              <span className={`os-status-badge status-${os.status}`}>{os.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="os-card-body">
              <p><strong>Status do Trabalhador:</strong> {os.trabalhador_id ? 'Atribuído' : 'Aguardando Aceite'}</p>
              <p><strong>Criada em:</strong> {new Date(os.created_at).toLocaleDateString()}</p>
            </div>
            <div className="os-card-actions">
              <button className="btn btn-primary" onClick={() => handleNavegarParaOS(os)}>
                {os.status === 'em_andamento' ? 'Acessar Sala' : 'Ver Detalhes'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="minhas-os-page-container">
      {/* SUBSTITUIÇÃO DO HEADER ANTIGO */}
      <HeaderEstiloTop showUserActions={false} />
      <main className="os-container">
        <h1>Minhas Ordens de Serviço</h1>
        {renderListaOS()}
      </main>
    </div>
  );
};

export default MinhasOrdensDeServico;
