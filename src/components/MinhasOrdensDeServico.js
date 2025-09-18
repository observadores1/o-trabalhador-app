// src/MinhasOrdensDeServico.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import './MinhasOrdensDeServico.css'; // Vamos criar este arquivo de estilo a seguir

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
        // Busca as ordens de serviço onde o usuário logado é o contratante
        const { data, error } = await supabase
          .from('ordens_de_servico')
          .select(`
            id,
            created_at,
            descricao_servico,
            status,
            trabalhador_id
          `)
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

  if (isLoading) {
    return <div className="os-container"><p>Carregando suas ordens de serviço...</p></div>;
  }

  return (
    <div className="os-container">
      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">← Voltar ao Dashboard</button>
      <h1>Minhas Ordens de Serviço</h1>

      {ordens.length === 0 ? (
        <p>Você ainda não criou nenhuma ordem de serviço.</p>
      ) : (
        <div className="os-lista">
          {ordens.map((os) => (
            <div key={os.id} className={`os-card status-${os.status}`}>
              <div className="os-card-header">
                <h3>{os.descricao_servico.substring(0, 50)}...</h3>
                <span className="os-status">{os.status.replace('_', ' ')}</span>
              </div>
              <div className="os-card-body">
                <p><strong>Status do Trabalhador:</strong> {os.trabalhador_id ? 'Atribuído' : 'Oferta Pública'}</p>
                <p><strong>Criada em:</strong> {new Date(os.created_at).toLocaleDateString()}</p>
              </div>
              <div className="os-card-actions">
                {/* Futuramente, os botões de ação (Cancelar, Avaliar) virão aqui */}
                <button className="btn btn-primary" onClick={() => navigate(`/os/${os.id}`)}>Ver Detalhes</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinhasOrdensDeServico;
