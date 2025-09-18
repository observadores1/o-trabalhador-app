// src/components/AvaliacaoEstrelas.js

import React, { useState } from 'react';
import './AvaliacaoEstrelas.css'; // Importando o CSS para estilização

const AvaliacaoEstrelas = ({ onAvaliar }) => {
  const [estrelas, setEstrelas] = useState(0);
  const [hoverEstrelas, setHoverEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAvaliarClick = async () => {
    if (estrelas === 0) {
      alert('Por favor, selecione pelo menos uma estrela.');
      return;
    }
    setSubmitting(true);
    // A função onAvaliar será passada pelo componente pai (DetalhesOS)
    // e conterá a lógica para chamar o Supabase.
    await onAvaliar({ estrelas, comentario });
    setSubmitting(false);
  };

  return (
    <div className="avaliacao-container">
      <h4>Avalie o Serviço</h4>
      <p>Sua avaliação é muito importante. Por favor, deixe sua opinião sobre o serviço prestado.</p>
      
      <div className="estrelas-wrapper">
        {[1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            className={`estrela ${index <= (hoverEstrelas || estrelas) ? 'preenchida' : ''}`}
            onClick={() => setEstrelas(index)}
            onMouseEnter={() => setHoverEstrelas(index)}
            onMouseLeave={() => setHoverEstrelas(0)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        className="comentario-textarea"
        placeholder="Deixe um comentário sobre sua experiência (opcional)..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      <button 
        className="btn btn-primary" 
        onClick={handleAvaliarClick}
        disabled={submitting || estrelas === 0}
      >
        {submitting ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
};

export default AvaliacaoEstrelas;
