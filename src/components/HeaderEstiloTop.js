// src/components/HeaderEstiloTop.js - VERSÃO COM BOTÃO DE ALTERNÂNCIA

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import './HeaderEstiloTop.css';

const HeaderEstiloTop = ({ showUserActions = true }) => {
  // ===== 1. IMPORTAR 'alternarPerfil' E 'perfilAtivo' DO CONTEXTO =====
  const { user, signOut, alternarPerfil, perfilAtivo } = useAuth();
  const navigate = useNavigate();

  const nomeUsuario = user?.user_metadata?.apelido || user?.email;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="header-estilo-top">
      <div className="header-content">
        <div className="logo-container" onClick={() => navigate('/dashboard')} title="Voltar ao Painel">
          <img src={logo} alt="Logo O Trabalhador" className="logo-img" />
          <h1>O Trabalhador</h1>
        </div>

        <div className="user-info">
          {showUserActions ? (
            <>
              <span>Olá, {nomeUsuario}</span>
              <div className="header-user-actions">
                {/* ===== 2. ADICIONAR O BOTÃO DE ALTERNÂNCIA DE PERFIL ===== */}
                <button 
                  onClick={alternarPerfil} 
                  className="btn btn-primary" // Usando uma cor que chama a atenção
                  title={`Mudar para visão de ${perfilAtivo === 'trabalhador' ? 'Contratante' : 'Trabalhador'}`}
                >
                  {/* Ícone de troca (Unicode) para feedback visual */}
                  &#x21C4; Mudar Perfil
                </button>
                
                <button onClick={() => navigate('/perfil/editar')} className="btn btn-secondary">
                  Perfil
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="btn btn-danger btn-logout-header"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
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
