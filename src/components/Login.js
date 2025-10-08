// src/components/Login.js - VERSÃO FINAL COM POP-UP DE BOAS-VINDAS
/**
 * @file Login.js
 * @description Componente de autenticação de usuário.
 * @author Jeferson Gnoatto
 * @date 2025-09-25
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react'; // ADICIONADO: useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import WelcomePopup from './WelcomePopup'; // ADICIONADO: Importa o pop-up
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ===== INÍCIO DA LÓGICA DO POP-UP =====
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  // ===== FIM DA LÓGICA DO POP-UP =====

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // ===== INÍCIO DA LÓGICA DO POP-UP =====
  useEffect(() => {
    // Verifica se o usuário já viu o pop-up nesta sessão
    const hasSeenPopup = sessionStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      // Se não viu, mostra o pop-up
      setShowWelcomePopup(true);
    }
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  const handleClosePopup = () => {
    // Fecha o pop-up e marca no sessionStorage que ele já foi visto
    setShowWelcomePopup(false);
    sessionStorage.setItem('hasSeenWelcomePopup', 'true');
  };
  // ===== FIM DA LÓGICA DO POP-UP =====

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
      {/* ADICIONADO: Renderização condicional do pop-up */}
      {showWelcomePopup && <WelcomePopup onClose={handleClosePopup} />}

      <div className="login-card">
        <img src={logo} alt="Logo O Trabalhador" className="login-logo" />
        <h2>
          Entrar no
          <span className="app-name">O Trabalhador</span>
        </h2>

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
