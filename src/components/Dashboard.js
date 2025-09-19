// src/components/Dashboard.js - ATUALIZADO COM POP-UP DE AVALIAÇÃO PENDENTE

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // Importando o Supabase
import BuscaContratante from './BuscaContratante';
import ResultadosBusca from './ResultadosBusca';
import HeaderEstiloTop from './HeaderEstiloTop';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState('dashboard');
  const [resultados, setResultados] = useState([]);
  const [termoBusca, setTermoBusca] = useState({ servico: '', localizacao: '' });

  // --- NOVOS ESTADOS PARA AVALIAÇÃO PENDENTE ---
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([]);
  const [isLoadingPendencias, setIsLoadingPendencias] = useState(true);

  const tipoUsuario = user?.user_metadata?.tipo_usuario || 'trabalhador';

  // --- NOVO EFEITO PARA VERIFICAR PENDÊNCIAS ---
  useEffect(() => {
    const verificarPendencias = async () => {
      // Executa apenas se o usuário for um contratante
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


  const handleBuscar = (dadosBusca) => {
    setResultados(dadosBusca.resultados || []);
    setTermoBusca({ servico: dadosBusca.servico, localizacao: dadosBusca.localizacao });
    setTelaAtual('resultados');
  };

  const handleVerPerfil = (trabalhador) => {
    if (trabalhador && trabalhador.id) {
      navigate(`/perfil/${trabalhador.id}`);
    } else {
      console.error("ID do trabalhador não encontrado para navegar.");
    }
  };

  const handleVoltarBusca = () => {
    setTelaAtual('dashboard');
  };

  // --- NOVO COMPONENTE INTERNO PARA O POP-UP ---
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
    if (telaAtual === 'resultados') {
      return (
        <ResultadosBusca 
          resultados={resultados}
          termoBusca={termoBusca}
          onVerPerfil={handleVerPerfil}
          onVoltarBusca={handleVoltarBusca}
        />
      );
    }

    const temPendencias = avaliacoesPendentes.length > 0;

    return (
      <main className="dashboard-main">
        {tipoUsuario === 'contratante' ? (
          <div className="contratante-dashboard">
            <h2>Encontre o profissional ideal</h2>
            <BuscaContratante onBuscar={handleBuscar} />
            <div className="form-actions" style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              
              {/* --- LÓGICA DE BLOQUEIO DO BOTÃO --- */}
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
      
      {/* --- RENDERIZAÇÃO CONDICIONAL DO POP-UP --- */}
      {avaliacoesPendentes.length > 0 && <PopupAvaliacaoPendente />}

      {renderConteudo()}
    </div>
  );
};

export default Dashboard;
