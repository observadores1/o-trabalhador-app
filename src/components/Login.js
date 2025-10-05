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
import logo from '../assets/logo.png';
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
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);
    
      if (signInError) {
        // ================== LÓGICA DE TRADUÇÃO ADICIONADA AQUI ==================
        if (signInError.message === 'Invalid login credentials') {
          setError('Credenciais de login inválidas. Verifique seu e-mail e senha.');
        } else if (signInError.message === 'Email not confirmed') {
          setError('Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.');
        } else {
          setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
          console.error('Erro de login do Supabase:', signInError.message);
        }
        // =======================================================================
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Captura erros de rede ou outros problemas inesperados
      console.error("Erro inesperado no login:", err);
      setError('Não foi possível conectar ao servidor. Verifique sua internet.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
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
          {/* O link para /forgot-password agora funcionará após criarmos a página */}
          <Link to="/forgot-password">Esqueceu a senha?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
