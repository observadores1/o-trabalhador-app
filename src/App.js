// src/App.js - VERSÃO CORRIGIDA E COMPLETA COM LÓGICA PWA
/**
 * @file App.js
 * @description Componente principal e roteador do aplicativo.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react'; // Re-adicionado useState e useEffect
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
import MeusTrabalhos from './components/MeusTrabalhos';
import ResultadosBusca from './components/ResultadosBusca';
import Footer from './components/Footer';

import './App.css';
import './botoes.css';

function AppLayout() {
  const { session } = useAuth();
  // ===== INÍCIO DA CORREÇÃO PWA =====
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault(); // Impede que o navegador mostre o banner padrão
      setInstallPrompt(event); // Salva o evento para usarmos depois
      console.log("PWA: Evento 'beforeinstallprompt' capturado.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Função de limpeza para remover o listener quando o componente desmontar
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  // ===== FIM DA CORREÇÃO PWA =====

  return (
    <div className="App">
      <div className="content-wrap">
        <Routes>
          {/* Passando a prop 'installPrompt' para o Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard installPrompt={installPrompt} /></ProtectedRoute>} />
          <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>} />
          <Route path="/perfil/:id" element={<ProtectedRoute><PerfilVitrine /></ProtectedRoute>} />
          <Route path="/perfil/editar" element={<ProtectedRoute><PerfilProfissional /></ProtectedRoute>} />
          <Route path="/nova-os" element={<ProtectedRoute><PaginaNovaOS /></ProtectedRoute>} />
          <Route path="/minhas-os" element={<ProtectedRoute><MinhasOrdensDeServico /></ProtectedRoute>} />
          <Route path="/os/:osId" element={<ProtectedRoute><DetalhesOS /></ProtectedRoute>} />
          <Route path="/os/:osId/editar" element={<ProtectedRoute><EditarOS /></ProtectedRoute>} />
          <Route path="/oportunidades" element={<ProtectedRoute><Oportunidades /></ProtectedRoute>} />
          <Route path="/trabalho/:osId" element={<ProtectedRoute><SalaDeTrabalho /></ProtectedRoute>} />
          <Route path="/meus-trabalhos" element={<ProtectedRoute><MeusTrabalhos /></ProtectedRoute>} />
          <Route path="/resultados-busca" element={<ProtectedRoute><ResultadosBusca /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {session && <WhatsAppButton />}
      {/* Passando a prop 'installPrompt' para o Footer */}
      <Footer installPrompt={installPrompt} />
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
