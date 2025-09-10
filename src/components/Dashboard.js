import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BuscaContratante from './BuscaContratante';
import ResultadosBusca from './ResultadosBusca';
import './Dashboard.css';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState('dashboard');
  const [resultados, setResultados] = useState([]);
  const [termoBusca, setTermoBusca] = useState({ servico: '', localizacao: '' });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleBuscar = (dadosBusca) => {
    // Os resultados agora vêm diretamente do componente BuscaContratante
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

  const tipoUsuario = user?.user_metadata?.tipo_usuario || 'trabalhador';
  const nomeUsuario = user?.user_metadata?.apelido || user?.email;

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

    return (
      <main className="dashboard-main">
        {tipoUsuario === 'contratante' ? (
          <div className="contratante-dashboard">
            <h2>Encontre o profissional ideal</h2>
            <BuscaContratante onBuscar={handleBuscar} />
          </div>
        ) : (
          <div className="trabalhador-dashboard">
            <h2>Bem-vindo ao seu painel</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>Meu Perfil</h3>
                <p>Gerencie suas informações profissionais</p>
                <button onClick={() => navigate(`/perfil/${user.id}`)}>
                  Ver Perfil
                </button>
              </div>
              
              <div className="dashboard-card">
                <h3>Oportunidades</h3>
                <p>Veja trabalhos disponíveis na sua área</p>
                <button disabled>
                  Ver Oportunidades
                </button>
              </div>
              
              <div className="dashboard-card">
                <h3>Meus Trabalhos</h3>
                <p>Acompanhe seus trabalhos em andamento</p>
                <button disabled>
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
      <header className="dashboard-header">
        <div className="header-content">
          <h1>O Trabalhador</h1>
          <div className="user-info">
            <span>Olá, {nomeUsuario}</span>
            <span className="user-type">({tipoUsuario})</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      {renderConteudo()}
    </div>
  );
};

export default Dashboard;


