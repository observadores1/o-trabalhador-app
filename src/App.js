import React, { useState } from 'react';
import './App.css';
import BuscaContratante from './components/BuscaContratante';
import ResultadosBusca from './components/ResultadosBusca';
import { buscarTrabalhadores } from './data/mockData';

function App() {
  const [telaAtual, setTelaAtual] = useState('busca'); // 'busca' ou 'resultados'
  const [resultados, setResultados] = useState([]);
  const [termoBusca, setTermoBusca] = useState({ servico: '', localizacao: '' });

  const handleBuscar = (dadosBusca) => {
    const trabalhadoresEncontrados = buscarTrabalhadores(dadosBusca.servico, dadosBusca.localizacao);
    setResultados(trabalhadoresEncontrados);
    setTermoBusca(dadosBusca);
    setTelaAtual('resultados');
  };

  const handleVerPerfil = (trabalhador) => {
    // Por enquanto, apenas mostra um alert
    // Futuramente será implementada a tela de perfil
    alert(`Perfil de ${trabalhador.nome} - Em desenvolvimento!`);
  };

  const handleVoltarBusca = () => {
    setTelaAtual('busca');
  };

  return (
    <div className="App">
      {telaAtual === 'busca' && (
        <BuscaContratante onBuscar={handleBuscar} />
      )}
      
      {telaAtual === 'resultados' && (
        <ResultadosBusca 
          resultados={resultados}
          termoBusca={termoBusca}
          onVerPerfil={handleVerPerfil}
          onVoltarBusca={handleVoltarBusca}
        />
      )}
    </div>
  );
}

export default App;
