// src/App.js - VERSÃO FINAL COM PIXEL DO FACEBOOK INTEGRADO
/**
 * @file App.js
 * @description Componente principal e roteador do aplicativo.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ===== INÍCIO DA IMPLEMENTAÇÃO DO PIXEL =====
import ReactPixel from 'react-facebook-pixel';
import PixelTracker from './components/PixelTracker'; // Importa nosso componente rastreador
// ===== FIM DA IMPLEMENTAÇÃO DO PIXEL =====

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

// ===== INÍCIO DA IMPLEMENTAÇÃO DO PIXEL =====
// Opções de configuração do Pixel
const options = {
  autoConfig: true, // Deixe como true para configuração automática
  debug: false,     // Mude para true para ver logs detalhados no console do navegador
};
// Inicializa o Pixel com seu ID. Isso só precisa ser feito uma vez.
ReactPixel.init('1481808609495330', null, options);
// O primeiro 'PageView' é disparado automaticamente na inicialização.
// ===== FIM DA IMPLEMENTAÇÃO DO PIXEL =====


function AppLayout() {
  const { session } = useAuth();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      console.log("PWA: Evento 'beforeinstallprompt' capturado.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <div className="App">
      <div className="content-wrap">
        <Routes>
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
      <Footer installPrompt={installPrompt} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ===== INÍCIO DA IMPLEMENTAÇÃO DO PIXEL ===== */}
        {/* O PixelTracker escuta as mudanças de rota e dispara os PageViews */}
        <PixelTracker />
        {/* ===== FIM DA IMPLEMENTAÇÃO DO PIXEL ===== */}
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
