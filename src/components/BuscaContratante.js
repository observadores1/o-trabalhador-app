import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarTrabalhadores } from '../data/mockData';
import './BuscaContratante.css';

const BuscaContratante = ({ onBuscar }) => {
  const [servico, setServico] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!servico.trim()) {
      alert('Por favor, digite o tipo de serviço que você precisa.');
      return;
    }

    // Se onBuscar foi passado como prop (uso no Dashboard), usar a função
    if (onBuscar) {
      onBuscar({ servico: servico.trim(), localizacao: localizacao.trim() });
    } else {
      // Caso contrário, usar navegação (uso standalone)
      const resultados = buscarTrabalhadores(servico.trim(), localizacao.trim());
      navigate('/resultados', { 
        state: { 
          resultados, 
          termoBusca: { servico: servico.trim(), localizacao: localizacao.trim() } 
        } 
      });
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

