import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarTrabalhadoresSupabase } from '../services/buscaService';
import './BuscaContratante.css';

const BuscaContratante = ({ onBuscar }) => {
  const [servico, setServico] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const habilidadesDisponiveis = [
    'Pintor', 'Eletricista', 'Encanador', 'Jardineiro', 'Pedreiro', 
    'Marceneiro', 'Soldador', 'Mecânico', 'Limpeza', 'Cozinheiro', 
    'Babá', 'Cuidador de Idosos'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!servico) { // Alterado para verificar se o serviço foi selecionado
      alert('Por favor, selecione o tipo de serviço que você precisa.');
      return;
    }

    setIsLoading(true);

    try {
      let resultados = await buscarTrabalhadoresSupabase(servico, localizacao.trim(), cidade.trim(), estado.trim());
      
      if (onBuscar) {
        onBuscar({ servico: servico, localizacao: localizacao.trim(), cidade: cidade.trim(), estado: estado.trim(), resultados });
      } else {
        navigate('/resultados', { 
          state: { 
            resultados, 
            termoBusca: { servico: servico, localizacao: localizacao.trim(), cidade: cidade.trim(), estado: estado.trim() } 
          } 
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao buscar trabalhadores. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="busca-container">
      <div className="busca-header">
        <img src="https://raw.githubusercontent.com/observadores1/o-trabalhador-app/main/Logo%20o%20Trabalhador.jpeg" alt="Logo O Trabalhador" className="logo" />
        <h1>O TRABALHADOR</h1>
        <p>Encontre o profissional ideal para seu serviço</p>
      </div>
      
      <form className="busca-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="servico">Qual serviço você precisa?</label>
          <select
            id="servico"
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="form-input"
            required
          >
            <option value="">-- Selecione um serviço --</option>
            {habilidadesDisponiveis.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
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

        <div className="form-group">
          <label htmlFor="cidade">Cidade</label>
          <input
            type="text"
            id="cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex: São Paulo, Rio de Janeiro..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado (UF)</label>
          <input
            type="text"
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            placeholder="Ex: SP, RJ, MG..."
            className="form-input"
          />
        </div>

        <button type="submit" className="buscar-btn" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar Trabalhadores'}
        </button>
      </form>
    </div>
  );
};

export default BuscaContratante;


