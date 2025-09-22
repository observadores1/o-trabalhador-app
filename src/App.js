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
import Footer from './components/Footer'; // <-- Importa o Rodapé
import ModalInvestimento from './components/ModalInvestimento'; // <-- Importa o Modal

import './App.css';
import './botoes.css';

function AppLayout() {
  const { session } = useAuth();
  const [showModalInvestimento, setShowModalInvestimento] = useState(false);

  useEffect(() => {
    // Verifica no localStorage se o modal já foi exibido
    const modalJaExibido = localStorage.getItem('modalInvestimentoExibido');
    if (!modalJaExibido && session) {
      // Se não foi exibido e o usuário está logado, exibe o modal
      setShowModalInvestimento(true);
    }
  }, [session]);

  const handleCloseModal = () => {
    // Marca como exibido no localStorage e fecha o modal
    localStorage.setItem('modalInvestimentoExibido', 'true');
    setShowModalInvestimento(false);
  };

  return (
    <div className="App">
      {showModalInvestimento && <ModalInvestimento onClose={handleCloseModal} />}
      <div className="content-wrap">
        <Routes>
          {/* ... (todas as suas rotas permanecem exatamente as mesmas) ... */}
          <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
      <Footer />
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
