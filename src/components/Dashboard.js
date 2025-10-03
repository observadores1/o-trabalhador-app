// src/pages/Dashboard.js - CÓDIGO ATUALIZADO

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BuscaContratante from '../components/BuscaContratante';
import HeaderEstiloTop from '../components/HeaderEstiloTop';
import InstallPWA from '../components/InstallPWA';
import './Dashboard.css';

const Dashboard = () => {
  const { user, avaliacoesPendentes, loading } = useAuth();
  const navigate = useNavigate();

  const tipoUsuario = user?.user_metadata?.tipo_usuario || 'trabalhador';

  const handleBuscar = (filtros) => {
    if (!filtros.habilidade) {
      alert('Por favor, selecione uma habilidade para realizar a busca.');
      return;
    }

    // ================== CÂMERA DE SEGURANÇA #2 ==================
    console.log('[CÂMERA 2 - Dashboard] Filtros recebidos do formulário:', filtros);
    // ==========================================================

    const params = new URLSearchParams();
    params.append('habilidade', filtros.habilidade);

    if (filtros.cidade) {
      params.append('cidade', filtros.cidade);
    }
    if (filtros.estado) {
      params.append('estado', filtros.estado);
    }

    const urlDeBusca = `/resultados-busca?${params.toString()}`;

    // ================== CÂMERA DE SEGURANÇA #3 ==================
    console.log('[CÂMERA 3 - Dashboard] Navegando para a URL:', urlDeBusca);
    // ==========================================================

    navigate(urlDeBusca);
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <HeaderEstiloTop showUserActions={true} />
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const temPendencias = avaliacoesPendentes.length > 0;

  return (
    <div className="dashboard-container">
      <InstallPWA mode="banner" />
      <HeaderEstiloTop showUserActions={true} />
      {temPendencias && <PopupAvaliacaoPendente />}
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
                  disabled={temPendencias}
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
              {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
              <div className="dashboard-card card-perfil">
                <h3>Meu Perfil</h3>
                <p>Gerencie suas informações profissionais</p>
                <button className="btn btn-primary" onClick={() => navigate(`/perfil/editar`)}>
                  Editar Perfil
                </button>
              </div>
              <div className="dashboard-card card-oportunidades">
                <h3>Oportunidades</h3>
                <p>Veja trabalhos disponíveis na sua área</p>
                <button className="btn btn-primary" onClick={() => navigate('/oportunidades')}>
                  Ver Oportunidades
                </button>
              </div>
              <div className="dashboard-card card-meus-trabalhos">
                <h3>Meus Trabalhos</h3>
                <p>Acompanhe seus trabalhos em andamento</p>
                <button className="btn btn-primary" onClick={() => navigate('/meus-trabalhos')}>
                  Ver Trabalhos
                </button>
              </div>
              {/* ===== FIM DA ALTERAÇÃO ===== */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
