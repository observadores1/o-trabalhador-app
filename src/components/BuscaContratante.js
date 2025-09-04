import React, { useState } from 'react';
import './BuscaContratante.css';

const BuscaContratante = ({ onBuscar }) => {
  const [servico, setServico] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (servico.trim() && localizacao.trim()) {
      onBuscar({ servico: servico.trim(), localizacao: localizacao.trim() });
    }
  };

  return (
    <div className="busca-container">
      <div className="busca-header">
        <h1>O TRABALHADOR</h1>
        <p>Encontre o profissional ideal para seu serviço</p>
      </div>
      
      <form className="busca-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="servico">Qual serviço você precisa?</label>
          <input
            type="text"
            id="servico"
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            placeholder="Ex: Pintor, Eletricista, Encanador..."
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="localizacao">Onde é o serviço?</label>
          <input
            type="text"
            id="localizacao"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            placeholder="Ex: Centro, Copacabana, São Paulo..."
            className="form-input"
            required
          />
        </div>

        <button type="submit" className="buscar-btn">
          Buscar Trabalhadores
        </button>
      </form>
    </div>
  );
};

export default BuscaContratante;

