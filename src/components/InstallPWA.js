// src/components/InstallPWA.js - NOVO ARQUIVO
import React from 'react';
import './InstallPWA.css'; // Vamos criar este CSS a seguir

const InstallPWA = ({ prompt, mode = 'banner' }) => {
  const handleInstallClick = () => {
    if (prompt) {
      prompt.prompt(); // Mostra o prompt de instalação do navegador
      prompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação do PWA');
        } else {
          console.log('Usuário recusou a instalação do PWA');
        }
        // O prompt não pode ser usado novamente, então limpamos o estado no App.js
        // (A lógica de limpar o estado já está implícita, pois o evento não será disparado novamente)
      });
    }
  };

  if (!prompt) {
    return null; // Se não há prompt, não renderiza nada
  }

  if (mode === 'banner') {
    return (
      <div className="pwa-install-banner">
        <p>Instale nosso app para uma melhor experiência!</p>
        <button onClick={handleInstallClick} className="btn-install">
          Instalar
        </button>
      </div>
    );
  }

  if (mode === 'button') {
    return (
      <button onClick={handleInstallClick} className="btn-install-footer">
        Instalar Aplicativo
      </button>
    );
  }

  return null;
};

export default InstallPWA;
