// src/components/BuscaContratante.js - SEU CÓDIGO + CÂMERA DE RASTREAMENTO

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import SeletorDeLocalizacao from './SeletorDeLocalizacao';

const BuscaContratante = ({ onBuscar }) => {
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadeSelecionada, setHabilidadeSelecionada] = useState('');
  const [localizacao, setLocalizacao] = useState({ estado: '', cidade: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarHabilidades = async () => {
      const { data, error } = await supabase.from('habilidades').select('nome').order('nome', { ascending: true });
      if (error) {
        console.error("Erro ao carregar habilidades:", error);
      } else {
        setHabilidades(data.map(h => h.nome));
      }
    };
    carregarHabilidades();
  }, []);

  const handleLocalizacaoChange = (novaLocalizacao) => {
    setLocalizacao(novaLocalizacao);
  };

  const handleEstadoChange = (estado) => {
    setLocalizacao({ estado: estado, cidade: '' });
  };

  const handleCidadeChange = (cidade) => {
    setLocalizacao(prevState => ({ ...prevState, cidade: cidade }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!habilidadeSelecionada) {
      setError('Por favor, selecione uma habilidade.');
      return;
    }

    setIsLoading(true);

    const filtrosParaEnviar = {
      habilidade: habilidadeSelecionada,
      cidade: localizacao.cidade,
      estado: localizacao.estado,
    };

    // ================== CÂMERA DE SEGURANÇA #1 ==================
    console.log('[CÂMERA 1 - BuscaContratante] Filtros que saíram do formulário:', filtrosParaEnviar);
    // ==========================================================

    onBuscar(filtrosParaEnviar);

    setIsLoading(false);
  };

  return (
    <div className="busca-contratante-container">
      <form onSubmit={handleSubmit} className="busca-form">
        <div className="form-group">
          <label htmlFor="habilidade-select">Qual serviço você precisa?</label>
          <select
            id="habilidade-select"
            value={habilidadeSelecionada}
            onChange={(e) => setHabilidadeSelecionada(e.target.value)}
            required
          >
            <option value="">Selecione uma habilidade</option>
            {habilidades.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <SeletorDeLocalizacao 
          onLocalizacaoChange={handleLocalizacaoChange}
          onEstadoChange={handleEstadoChange}
          onCidadeChange={handleCidadeChange}
        />

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar Trabalhadores'}
        </button>
        {error && <p className="error-message" style={{ marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default BuscaContratante;
