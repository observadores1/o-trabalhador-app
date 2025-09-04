import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexto de autenticação
import { AuthProvider } from './contexts/AuthContext';

// Componentes de autenticação
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

// Componentes existentes
import PerfilProfissional from './PerfilProfissional';
import BuscaContratante from './components/BuscaContratante';
import ResultadosBusca from './components/ResultadosBusca';

// Estilos
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rotas públicas */}
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

            {/* Rotas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <PerfilProfissional />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/busca" 
              element={
                <ProtectedRoute>
                  <BuscaContratante />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resultados" 
              element={
                <ProtectedRoute>
                  <ResultadosBusca />
                </ProtectedRoute>
              } 
            />

            {/* Rota padrão - redireciona para dashboard se autenticado, senão para login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
