// src/components/HeaderEstiloTop.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // Importando a imagem do logo
import './HeaderEstiloTop.css'; // Criaremos este arquivo a seguir

// O componente aceita 'props' para customização
const HeaderEstiloTop = ({ showUserActions = true }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const nomeUsuario = user?.user_metadata?.apelido || user?.email;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="header-estilo-top">
      <div className="header-content">
        {/* Logo e Título do App */}
        <div className="logo-container" onClick={() => navigate('/dashboard')} title="Voltar ao Painel">
          <img src={logo} alt="Logo O Trabalhador" className="logo-img" />
          <h1>O Trabalhador</h1>
        </div>

        {/* Ações do Usuário (à direita) */}
        <div className="user-info">
          {showUserActions ? (
            // Versão completa para o Dashboard
            <>
              <span>Olá, {nomeUsuario}</span>
              <button onClick={() => navigate('/perfil/editar')} className="btn btn-secondary">
                Perfil
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                Sair
              </button>
            </>
          ) : (
            // Versão simplificada para páginas internas
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Início
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderEstiloTop;
