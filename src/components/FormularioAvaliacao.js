// src/components/FormularioAvaliacao.js - VERSÃO FINAL CORRIGIDA

import React, { useState } from 'react';
import './FormularioAvaliacao.css';

const QUESITOS = [
  { id: 'pontualidade', label: 'Pontualidade' },
  { id: 'comunicacao', label: 'Comunicação e Respostas' },
  { id: 'atencao_cliente', label: 'Atenção ao Cliente' },
  { id: 'atencao_detalhes', label: 'Atenção aos Detalhes' },
  { id: 'organizacao', label: 'Organização do Trabalho' },
  { id: 'velocidade_execucao', label: 'Velocidade de Execução' },
  { id: 'proatividade', label: 'Proatividade' },
];

const Star = ({ filled, onClick, onMouseEnter }) => (
  <span className={`estrela-avaliacao ${filled ? 'preenchida' : ''}`} onClick={onClick} onMouseEnter={onMouseEnter}>
    ★
  </span>
);

const FormularioAvaliacao = ({ onSubmit, isSubmitting, comentarioConclusao, isPendente = false }) => {
  const [notas, setNotas] = useState(
    QUESITOS.reduce((acc, quesito) => ({ ...acc, [quesito.id]: 0 }), {})
  );
  const [hover, setHover] = useState(
    QUESITOS.reduce((acc, quesito) => ({ ...acc, [quesito.id]: 0 }), {})
  );

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const todasAvaliadas = Object.values(notas).every(nota => nota > 0);
    if (!todasAvaliadas) {
      alert("Por favor, avalie todos os quesitos antes de enviar.");
      return;
    }
    onSubmit(notas);
  };

  const isButtonDisabled = isSubmitting || (!isPendente && !comentarioConclusao?.trim());

  return (
    <div className="formulario-avaliacao-container">
      {QUESITOS.map((quesito) => (
        <div key={quesito.id} className="quesito-avaliacao">
          <label>{quesito.label}</label>
          <div 
            className="estrelas-container"
            onMouseLeave={() => setHover(prev => ({ ...prev, [quesito.id]: 0 }))}
          >
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <Star
                  key={index}
                  filled={ratingValue <= (hover[quesito.id] || notas[quesito.id])}
                  onClick={() => setNotas(prev => ({ ...prev, [quesito.id]: ratingValue }))}
                  onMouseEnter={() => setHover(prev => ({ ...prev, [quesito.id]: ratingValue }))}
                />
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={handleFinalSubmit} className="btn btn-success" disabled={isButtonDisabled}>
        {isSubmitting 
          ? 'Enviando...' 
          : (isPendente ? 'Enviar Avaliação' : 'Confirmar Conclusão e Enviar Avaliação')}
      </button>
    </div>
  );
};

export default FormularioAvaliacao;
