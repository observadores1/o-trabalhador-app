/**
 * @file Login.js
 * @description Componente de autenticação de usuário.
 * @author Jeferson Gnoatto
 * @date 2025-09-25
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // <-- IMPORTAÇÃO DO LOGO
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate(from, { replace: true });
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* ================== CORREÇÕES APLICADAS AQUI ================== */}
        
        {/* 1. Logo adicionado */}
        <img src={logo} alt="Logo O Trabalhador" className="login-logo" />

        {/* 2. Título em duas linhas */}
        <h2>
          Entrar no
          <span className="app-name">O Trabalhador</span>
        </h2>
        
        {/* ============================================================= */}

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="login-links">
          <Link to="/register">Não tem conta? Cadastre-se</Link>
          <Link to="/forgot-password">Esqueceu a senha?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
