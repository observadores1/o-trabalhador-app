import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultadosBusca.css'; // Supondo que você tenha um arquivo de estilo

const getOptimizedUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'; // Use a mesma URL de fallback
  return `${url}?width=80&height=80&resize=cover`; 
};

const ResultadosBusca = ({ resultados, termoBusca, onVoltarBusca }) => {
  const navigate = useNavigate();

  const handleVerPerfil = (trabalhadorId) => {
    if (trabalhadorId) {
      navigate(`/perfil/${trabalhadorId}`);
    } else {
      console.error("ID do trabalhador inválido para navegação.");
    }
  };

  if (!resultados || resultados.length === 0) {
    return (
      <div className="resultados-container">
        <h2>Busca por "{termoBusca.servico}"</h2>
        <p>Nenhum trabalhador encontrado.</p>
        <button onClick={onVoltarBusca} className="btn btn-secondary">Fazer Nova Busca</button>
      </div>
    );
  }

  return (
    <div className="resultados-container">
      <h2>Trabalhadores Encontrados</h2>
      <div className="lista-trabalhadores">
        {resultados.map((trabalhador) => (
          <div key={trabalhador.id} className="trabalhador-card">
            <img 
              src={getOptimizedUrl(trabalhador.foto_perfil_url)} 
              alt={trabalhador.apelido} 
            />
            <h3>{trabalhador.apelido}</h3>
            <p>{trabalhador.titulo_profissional || 'Trabalhador'}</p>
            
            {/* ================================================== */}
            {/* AQUI ESTÁ A CORREÇÃO QUE RESOLVE O ERRO 'toFixed' */}
            {/* ================================================== */}
            <div className="avaliacao">
              ⭐ {trabalhador.avaliacao_media ? Number(trabalhador.avaliacao_media ).toFixed(1) : 'N/A'}
            </div>

            <div className="habilidades-preview">
              {(trabalhador.habilidades || []).slice(0, 3).map(h => <span key={h}>{h}</span>)}
            </div>

            <button className="btn btn-primary" onClick={() => handleVerPerfil(trabalhador.id)}>Ver Perfil</button>
          </div>
        ))}
      </div>
      <button onClick={onVoltarBusca} className="btn btn-secondary">Fazer Nova Busca</button>
    </div>
  );
};

export default ResultadosBusca;
