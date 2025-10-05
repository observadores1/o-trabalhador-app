// src/components/HeaderEstiloTop.js - VERSÃO COM O BOTÃO DE TROCA DE PERFIL (DESIGN MELHORADO)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import './HeaderEstiloTop.css';

const HeaderEstiloTop = ({ showUserActions = true }) => {
  const { user, signOut, trocarPerfil, perfilAtivo } = useAuth();
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
          {showUserActions && user ? (
            <>
              <span>Olá, {nomeUsuario}</span>
              
              {/* ===== BOTÃO DE TROCA DE PERFIL - VERSÃO MELHORADA ===== */}
              <button onClick={trocarPerfil} className="btn btn-switch-profile" title="Alternar perfil">
                <span className="switch-icon">⇄</span> {/* Ícone de troca */}
                <span className="switch-text">
                  {perfilAtivo === 'contratante' ? 'Contratante' : 'Trabalhador'}
                </span>
              </button>
              {/* ======================================================= */}

              <button onClick={() => navigate('/perfil/editar')} className="btn btn-secondary">
                Perfil
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                Sair
              </button>
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
