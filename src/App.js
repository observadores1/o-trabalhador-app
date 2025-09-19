// src/App.js - ATUALIZADO COM A ROTA PARA MEUS TRABALHOS

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import PerfilProfissional from './PerfilProfissional';
import PerfilVitrine from './components/PerfilVitrine';
import WhatsAppButton from './components/WhatsAppButton';
import PaginaNovaOS from './PaginaNovaOS';
import DetalhesOS from './components/DetalhesOS';
import MinhasOrdensDeServico from './components/MinhasOrdensDeServico';
import EditarOS from './components/EditarOS';
import Oportunidades from './components/Oportunidades';
import SalaDeTrabalho from './components/SalaDeTrabalho';
import MeusTrabalhos from './components/MeusTrabalhos'; // <<-- 1. IMPORTAÇÃO ADICIONADA

import './App.css';
import './botoes.css';

function AppLayout() {
  const { session } = useAuth();
  return (
    <div className="App">
      <Routes>
        {/* --- Rotas de Autenticação e Dashboard --- */}
        <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* --- Rotas de Perfil --- */}
        <Route path="/perfil/:id" element={<ProtectedRoute><PerfilVitrine /></ProtectedRoute>} />
        <Route path="/perfil/editar" element={<ProtectedRoute><PerfilProfissional /></ProtectedRoute>} />
        
        {/* --- Rotas de Ordem de Serviço (Contratante) --- */}
        <Route path="/nova-os" element={<ProtectedRoute><PaginaNovaOS /></ProtectedRoute>} />
        <Route path="/minhas-os" element={<ProtectedRoute><MinhasOrdensDeServico /></ProtectedRoute>} />
        <Route path="/os/:osId" element={<ProtectedRoute><DetalhesOS /></ProtectedRoute>} />
        <Route path="/os/:osId/editar" element={<ProtectedRoute><EditarOS /></ProtectedRoute>} />

        {/* --- Rotas do Trabalhador --- */}
        <Route path="/oportunidades" element={<ProtectedRoute><Oportunidades /></ProtectedRoute>} />
        <Route path="/trabalho/:osId" element={<ProtectedRoute><SalaDeTrabalho /></ProtectedRoute>} />
        
        {/* --- 2. NOVA ROTA DE MEUS TRABALHOS --- */}
        <Route path="/meus-trabalhos" element={<ProtectedRoute><MeusTrabalhos /></ProtectedRoute>} />

        {/* --- Rotas de Redirecionamento --- */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {session && <WhatsAppButton />}
    </div>
  );
}

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
