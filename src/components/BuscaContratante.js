import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarTrabalhadoresSupabase, buscarTrabalhadoresFallback } from '../services/buscaService';
import './BuscaContratante.css';

const BuscaContratante = ({ onBuscar }) => {
  const [servico, setServico] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!servico.trim()) {
      alert('Por favor, digite o tipo de serviço que você precisa.');
      return;
    }

    setIsLoading(true);

    try {
      // Tenta buscar no Supabase primeiro
      let resultados = await buscarTrabalhadoresSupabase(servico.trim(), localizacao.trim());
      
      // Se não encontrou resultados no Supabase, usa dados simulados como fallback
      if (resultados.length === 0) {
        console.log('Nenhum resultado encontrado no Supabase, usando dados simulados');
        resultados = buscarTrabalhadoresFallback(servico.trim(), localizacao.trim());
      }

      // Se onBuscar foi passado como prop (uso no Dashboard), usar a função
      if (onBuscar) {
        onBuscar({ servico: servico.trim(), localizacao: localizacao.trim(), resultados });
      } else {
        // Caso contrário, usar navegação (uso standalone)
        navigate('/resultados', { 
          state: { 
            resultados, 
            termoBusca: { servico: servico.trim(), localizacao: localizacao.trim() } 
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

        <button type="submit" className="buscar-btn" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar Trabalhadores'}
        </button>
      </form>
    </div>
  );
};

export default BuscaContratante;

