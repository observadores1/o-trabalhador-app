// src/pages/ResultadosBusca.js - SEU CÓDIGO + CÂMERAS DE RASTREAMENTO

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderEstiloTop from '../components/HeaderEstiloTop';
import { buscarPerfis } from '../services/buscaService';
import './ResultadosBusca.css';

const FOTO_PADRAO_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face';

const ResultadosBusca = (  ) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [resultados, setResultados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filtros = {
      habilidade: params.get('habilidade'),
      cidade: params.get('cidade'),
      estado: params.get('estado'),
    };

    // ================== CÂMERA DE SEGURANÇA #4 ==================
    console.log('[CÂMERA 4 - ResultadosBusca] Filtros lidos da URL:', filtros);
    // ==========================================================

    setTermoBusca(filtros);

    if (!filtros.habilidade) {
      setError("Nenhuma habilidade foi selecionada para a busca.");
      setIsLoading(false);
      return;
    }

    const executarBusca = async () => {
      setIsLoading(true);
      setError(null);
      
      // ================== CÂMERA DE SEGURANÇA #5 ==================
      console.log('[CÂMERA 5 - ResultadosBusca] Executando busca com os filtros:', filtros);
      // ==========================================================

      const { data, error: buscaError } = await buscarPerfis(filtros);

      // ================== CÂMERA DE SEGURANÇA #6 (A VERDADE) ==================
      console.log('%c[CÂMERA 6 - ResultadosBusca] Resposta do Supabase (Dados):', 'color: lightgreen; font-weight: bold;', data);
      console.error('[CÂMERA 6 - ResultadosBusca] Resposta do Supabase (Erro):', buscaError);
      // =====================================================================

      if (buscaError) {
        setError(buscaError.message);
      } else {
        setResultados(data || []);
      }
      setIsLoading(false);
    };

    executarBusca();
  }, [location.search]);

  const handleVerPerfil = (trabalhadorId) => {
    if (trabalhadorId) {
      navigate(`/perfil/${trabalhadorId}`);
    }
  };

  const onVoltarBusca = () => navigate('/dashboard');

  const renderConteudo = () => {
    if (isLoading) {
      return <p>Buscando trabalhadores...</p>;
    }

    if (error) {
      return (
        <div className="sem-resultados">
          <h2>Erro na Busca</h2>
          <p>{error}</p>
          <button onClick={onVoltarBusca} className="btn btn-secondary">Voltar</button>
        </div>
      );
    }

    if (resultados.length === 0) {
      return (
        <div className="sem-resultados">
          <h2>Busca por "{termoBusca.habilidade}"</h2>
          <p>Nenhum trabalhador encontrado com os critérios informados.</p>
          <button onClick={onVoltarBusca} className="btn btn-secondary">Fazer Nova Busca</button>
        </div>
      );
    }

    return (
      <>
        <h2>Trabalhadores Encontrados para "{termoBusca.habilidade}"</h2>
        <div className="lista-trabalhadores">
          {resultados.map((trabalhador) => (
            <div key={trabalhador.id} className="trabalhador-card">
              <img 
                src={trabalhador.foto_perfil_url || FOTO_PADRAO_URL} 
                alt={trabalhador.apelido}
                className="avatar-pequeno" 
              />
              <h3>{trabalhador.apelido}</h3>
              <p>{trabalhador.titulo_profissional || 'Trabalhador'}</p>
              
              <div className="avaliacao">
                ⭐ {trabalhador.avaliacao_media ? Number(trabalhador.avaliacao_media).toFixed(1) : 'N/A'}
              </div>

              <div className="habilidades-preview">
                {(trabalhador.habilidades || []).slice(0, 3).map(h => (
                  <span key={h} className="habilidade-tag-preview">{h}</span>
                ))}
              </div>

              <button className="btn btn-primary" onClick={() => handleVerPerfil(trabalhador.id)}>Ver Perfil</button>
            </div>
          ))}
        </div>
        <button onClick={onVoltarBusca} className="btn btn-secondary btn-nova-busca">Fazer Nova Busca</button>
      </>
    );
  };

  return (
    <div className="resultados-page-container">
      <HeaderEstiloTop showUserActions={true} />
      <main className="resultados-main-content">
        {renderConteudo()}
      </main>
    </div>
  );
};

export default ResultadosBusca;
