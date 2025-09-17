// src/App.js - VERSÃO ATUALIZADA COM A ROTA PARA NOVA ORDEM DE SERVIÇO

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexto de autenticação (a base da nossa segurança)
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componentes e Páginas
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import PerfilProfissional from './PerfilProfissional';
import PerfilVitrine from './components/PerfilVitrine';
import WhatsAppButton from './components/WhatsAppButton';
import PaginaNovaOS from './PaginaNovaOS'; // <-- 1. IMPORTAÇÃO DA NOVA PÁGINA

// Estilos
import './App.css';
import './botoes.css';

// Componente interno para gerenciar a lógica de exibição
function AppLayout() {
  const { session } = useAuth(); // Usamos o hook para saber se o usuário está logado

  return (
    <div className="App">
      <Routes>
        {/* Rotas Públicas: Acessíveis apenas para usuários deslogados */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } 
        />

        {/* Rotas Protegidas: Acessíveis apenas para usuários logados */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil/:id" 
          element={
            <ProtectedRoute>
              <PerfilVitrine />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil/editar" 
          element={
            <ProtectedRoute>
              <PerfilProfissional />
            </ProtectedRoute>
          } 
        />
        
        {/* ================================================== */}
        {/* 2. ADIÇÃO DA NOVA ROTA PARA ORDEM DE SERVIÇO       */}
        {/* ================================================== */}
        <Route 
          path="/nova-os" 
          element={
            <ProtectedRoute>
              <PaginaNovaOS />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota Padrão: Redireciona para o dashboard se logado, senão para o login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rota 404 (Coringa): Redireciona qualquer outra URL para a rota padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* O botão do WhatsApp só aparece se a sessão (usuário logado) existir */}
      {session && <WhatsAppButton />}
    </div>
  );
}

// Componente principal que envolve tudo com os provedores necessários
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
