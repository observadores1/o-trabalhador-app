// src/components/InstallPWA.js

import React, { useState, useEffect } from 'react';
import './InstallPWA.css';

// O componente aceita uma prop 'mode' que pode ser 'banner' ou 'button'
const InstallPWA = ({ mode = 'banner' }) => {
  const [prompt, setPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Captura o evento que o navegador dispara quando o app é instalável
    const handleInstallPrompt = (e) => {
      e.preventDefault(); // Previne o pop-up padrão do navegador
      setPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!prompt) return;

    // Mostra o prompt de instalação nativo do navegador
    prompt.prompt();

    // Aguarda a decisão do usuário
    prompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do PWA.');
        setIsVisible(false); // Esconde o componente após a instalação
      } else {
        console.log('Usuário recusou a instalação do PWA.');
      }
      // O prompt só pode ser usado uma vez, então limpamos o estado
      setPrompt(null);
    });
  };

  // Se o app não for instalável (o prompt não foi capturado), não renderiza nada.
  if (!prompt || !isVisible) {
    return null;
  }

  // Renderiza o BANNER se o modo for 'banner'
  if (mode === 'banner') {
    return (
      <div className="install-banner-container">
        <div className="install-banner-content">
          <h4>Leve o App com você!</h4>
          <p>Instale na sua tela inicial para acesso rápido.</p>
        </div>
        <button onClick={handleInstallClick} className="install-banner-button">
          Instalar
        </button>
      </div>
    );
  }

  // Renderiza o BOTÃO se o modo for 'button'
  if (mode === 'button') {
    return (
      <div className="install-button-container">
        <span>Ainda não instalou o app?</span>
        <button onClick={handleInstallClick} className="install-button-link">
          Clique aqui e instale agora
        </button>
      </div>
    );
  }

  // Retorno padrão caso um modo inválido seja passado
  return null;
};

export default InstallPWA;
