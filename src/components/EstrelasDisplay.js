// src/components/EstrelasDisplay.js

import React from 'react';
import './EstrelasDisplay.css';

const EstrelasDisplay = ({ nota }) => {
  const notaNumerica = parseInt(nota, 10);

  // Se a nota não for um número válido (NaN), exibe um placeholder.
  // Se a nota for 0, ela deve exibir 0 estrelas preenchidas, o que é tratado pela lógica do map abaixo.
  if (isNaN(notaNumerica)) {
    return <span className="estrelas-display-vazio">N/A</span>;
  }

  return (
    <div className="estrelas-display">
      {[...Array(5)].map((_, i) => (
        // Preenche a estrela se o índice for menor que a notaNumerica.
        // Se notaNumerica for 0, nenhuma estrela será preenchida, o que é o comportamento esperado.
        <span key={i} className={i < notaNumerica ? 'preenchida' : ''}>★</span>
      ))}
    </div>
  );
};

export default EstrelasDisplay;
