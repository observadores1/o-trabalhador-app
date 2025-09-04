import React, { useState, useEffect } from 'react';
import WhatsAppButton from './components/WhatsAppButton';

// Importações de AMBAS as features
import PerfilProfissional from './PerfilProfissional';
import BuscaContratante from './components/BuscaContratante';
import ResultadosBusca from './components/ResultadosBusca';

// Importações de estilo e dados
import './App.css';
import { buscarTrabalhadores } from './data/mockData';

function App() {
  // Estados para controlar a tela e os dados da busca
  const [telaAtual, setTelaAtual] = useState("busca"); // 'busca', 'resultados', ou 'perfil'
  const [resultados, setResultados] = useState([]);
  const [termoBusca, setTermoBusca] = useState({ servico: '', localizacao: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Novo estado para simular login

  // Simulação de login/logout para testes
  useEffect(() => {
    // Em uma aplicação real, isso viria de um contexto de autenticação
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  // Função para executar a busca quando o formulário é enviado
  const handleBuscar = (dadosBusca) => {
    const trabalhadoresEncontrados = buscarTrabalhadores(dadosBusca.servico, dadosBusca.localizacao);
    setResultados(trabalhadoresEncontrados);
    setTermoBusca(dadosBusca);
    setTelaAtual('resultados');
  };

  // Função para ver o perfil (ainda em desenvolvimento)
  const handleVerPerfil = (trabalhador) => {
    alert(`Exibindo perfil de ${trabalhador.nome} - Funcionalidade em desenvolvimento!`);
    // No futuro, aqui mudaremos a tela: setTelaAtual('perfil');
  };

  // Função para voltar para a tela de busca
  const handleVoltarBusca = () => {
    setTelaAtual('busca');
  };

  // Lógica para renderizar a tela correta
  const renderizarTela = () => {
    switch (telaAtual) {
      case 'resultados':
        return (
          <ResultadosBusca 
            resultados={resultados}
            termoBusca={termoBusca}
            onVerPerfil={handleVerPerfil}
            onVoltarBusca={handleVoltarBusca}
          />
        );
      // O case 'perfil' será adicionado no futuro
      // case 'perfil':
      //   return <PerfilProfissional />;
      case 'busca':
      default:
        return <BuscaContratante onBuscar={handleBuscar} />;
    }
  };

  return (
    <div className="App">
      {/* NOTA: A tela de PerfilProfissional não está visível ainda, 
          mas seu código está importado e pronto para ser usado 
          quando implementarmos a navegação completa. */}
      {renderizarTela()}
      {isLoggedIn && <WhatsAppButton />}
      {/* Botões de login/logout para teste */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: '1000' }}>
        {!isLoggedIn ? (
          <button onClick={handleLogin}>Login (para testar WhatsApp)</button>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
}

export default App;
