/**
 * @file ModalInvestimento.js
 * @description Modal para convidar usuários a investir na empresa.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React from 'react';
import './ModalInvestimento.css';

const ModalInvestimento = ({ onClose }) => {
  const WHATSAPP_LINK = "https://wa.me/SEUNUMERODOWHATSAPP?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20investir%20na%20empresa%20O%20Trabalhador.";

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Seja Sócio do Nosso Sucesso!</h3>
        <p>Quer se tornar dono de uma cota da empresa e investir no futuro do trabalho?</p>
        <p>Se sua resposta for <strong>sim</strong>, entre em contato conosco para saber mais!</p>
        <div className="modal-actions">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-success">
            Sim, quero saber mais! (WhatsApp )
          </a>
          <button onClick={onClose} className="btn btn-secondary">
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInvestimento;
