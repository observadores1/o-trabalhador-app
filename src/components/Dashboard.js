// src/components/Dashboard.js - ATUALIZADO PARA NAVEGAR PARA A PÁGINA DE RESULTADOS

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import BuscaContratante from './BuscaContratante';
// A importação de ResultadosBusca não é mais necessária aqui
import HeaderEstiloTop from './HeaderEstiloTop';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Os estados de resultados e termo de busca não são mais necessários aqui
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([]);
  const [isLoadingPendencias, setIsLoadingPendencias] = useState(true);

  const tipoUsuario = user?.user_metadata?.tipo_usuario || 'trabalhador';

  useEffect(() => {
    const verificarPendencias = async () => {
      if (tipoUsuario === 'contratante') {
        const { data, error } = await supabase.rpc('verificar_avaliacoes_pendentes');
        if (error) {
          console.error("Erro ao verificar avaliações pendentes:", error);
        } else if (data) {
          setAvaliacoesPendentes(data);
        }
      }
      setIsLoadingPendencias(false);
    };
    verificarPendencias();
  }, [tipoUsuario]);

  // --- FUNÇÃO handleBuscar ATUALIZADA ---
  const handleBuscar = (dadosBusca) => {
    // Em vez de mudar o estado local, navegamos para a nova rota
    // e passamos os resultados e o termo da busca no estado da navegação.
    navigate('/resultados-busca', { 
      state: { 
        resultados: dadosBusca.resultados || [],
        termoBusca: { servico: dadosBusca.servico, localizacao: dadosBusca.localizacao }
      } 
    });
  };

  const PopupAvaliacaoPendente = () => (
    <div className="popup-overlay">
      <div className="popup-container">
        <h3>Avaliação Pendente</h3>
        <p>Você precisa avaliar os seguintes serviços concluídos antes de criar uma nova oferta:</p>
        <div className="lista-pendencias">
          {avaliacoesPendentes.map(os => (
            <button 
              key={os.id} 
              className="btn-pendencia"
              onClick={() => navigate(`/trabalho/${os.id}`)}
            >
              Avaliar: "{os.titulo_servico}"
            </button>
          ))}
        </div>
        <p className="popup-info">Esta ação é necessária para manter a qualidade e a confiança em nossa comunidade.</p>
      </div>
    </div>
  );

  const renderConteudo = () => {
    // A lógica de renderizar ResultadosBusca foi removida daqui
    const temPendencias = avaliacoesPendentes.length > 0;

    return (
      <main className="dashboard-main">
        {tipoUsuario === 'contratante' ? (
          <div className="contratante-dashboard">
            <h2>Encontre o profissional ideal</h2>
            <BuscaContratante onBuscar={handleBuscar} />
            <div className="form-actions" style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <div className="tooltip-container">
                <button 
                  className="btn btn-success" 
                  onClick={() => !temPendencias && navigate('/nova-os')}
                  disabled={temPendencias || isLoadingPendencias}
                >
                  Criar Oferta de Serviço
                </button>
                {temPendencias && <span className="tooltip-text">Você possui avaliações pendentes!</span>}
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/minhas-os')}>
                Minhas Ordens de Serviço
              </button>
            </div>
          </div>
        ) : (
          <div className="trabalhador-dashboard">
            <h2>Bem-vindo ao seu painel</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>Meu Perfil</h3>
                <p>Gerencie suas informações profissionais</p>
                <button className="btn btn-primary" onClick={() => navigate(`/perfil/editar`)}>
                  Editar Perfil
                </button>
              </div>
              <div className="dashboard-card">
                <h3>Oportunidades</h3>
                <p>Veja trabalhos disponíveis na sua área</p>
                <button className="btn btn-primary" onClick={() => navigate('/oportunidades')}>
                  Ver Oportunidades
                </button>
              </div>
              <div className="dashboard-card">
                <h3>Meus Trabalhos</h3>
                <p>Acompanhe seus trabalhos em andamento</p>
                <button className="btn btn-primary" onClick={() => navigate('/meus-trabalhos')}>
                  Ver Trabalhos
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="dashboard-container">
      <HeaderEstiloTop showUserActions={true} />
      {avaliacoesPendentes.length > 0 && <PopupAvaliacaoPendente />}
      {renderConteudo()}
    </div>
  );
};

export default Dashboard;
