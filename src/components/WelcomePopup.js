// src/components/WelcomePopup.js - NOVO ARQUIVO
import React from 'react';
import './WelcomePopup.css'; // Vamos criar este arquivo a seguir

const WelcomePopup = ({ onClose }) => {
  return (
    <div className="popup-overlay-welcome">
      <div className="popup-container-welcome">
        <h2 className="popup-title-welcome">Seja Bem-Vindo ao O Trabalhador!</h2>
        <p className="popup-text-welcome">
          Pense neste aplicativo como um **UBER para trabalhadores**.
        </p>
        <p className="popup-text-welcome">
          É aqui dentro que todas as pessoas e empresas que precisam de um serviço procuram por prestadores qualificados. E você é um desses!
        </p>
        <p className="popup-text-welcome-bold">
          Se você quer ser encontrado, este é o ponto de encontro!
        </p>
        <button onClick={onClose} className="popup-button-welcome">
          Entendi, vamos lá!
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;
