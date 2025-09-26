// src/components/ResultadosBusca.js - ATUALIZADO COMO PÁGINA COMPLETA E COM AVALIAÇÃO REAL

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionando useLocation
import HeaderEstiloTop from './HeaderEstiloTop'; // Importando o Header
import './ResultadosBusca.css';

const FOTO_PADRAO_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face';

const ResultadosBusca = ( ) => { // Removendo as props, pois os dados virão da rota
  const navigate = useNavigate();
  const location = useLocation(); // Hook para acessar o estado da navegação

  // Pega os dados passados pela rota. Se não houver, usa valores padrão.
  const { resultados, termoBusca } = location.state || { resultados: [], termoBusca: {} };

  const handleVerPerfil = (trabalhadorId) => {
    if (trabalhadorId) {
      navigate(`/perfil/${trabalhadorId}`);
    } else {
      console.error("ID do trabalhador inválido para navegação.");
    }
  };

  // Função para voltar ao Dashboard
  const onVoltarBusca = () => navigate('/dashboard');

  const renderConteudo = () => {
    if (!resultados || resultados.length === 0) {
      return (
        <div className="sem-resultados">
          <h2>Busca por "{termoBusca.servico}"</h2>
          <p>Nenhum trabalhador encontrado com os critérios informados.</p>
          <button onClick={onVoltarBusca} className="btn btn-secondary">Fazer Nova Busca</button>
        </div>
      );
    }

    return (
      <>
        <h2>Trabalhadores Encontrados</h2>
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
              
              {/* --- LÓGICA DE AVALIAÇÃO REAL --- */}
              <div className="avaliacao">
                ⭐ {trabalhador.avaliacao_media ? Number(trabalhador.avaliacao_media).toFixed(1) : 'N/A'}
                <span className="total-avaliacoes">
                  ({trabalhador.total_avaliacoes || 0} {trabalhador.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'})
                </span>
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
    // Container principal que aplica o "Estilo Top"
    <div className="resultados-page-container">
      <HeaderEstiloTop showUserActions={true} />
      <main className="resultados-main-content">
        {renderConteudo()}
      </main>
    </div>
  );
};

export default ResultadosBusca;
