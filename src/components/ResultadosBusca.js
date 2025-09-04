import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultadosBusca.css';

const ResultadosBusca = ({ resultados: propsResultados, termoBusca: propsTermoBusca, onVerPerfil, onVoltarBusca }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Usar dados do state da navegação ou props (para compatibilidade)
  const resultados = location.state?.resultados || propsResultados || [];
  const termoBusca = location.state?.termoBusca || propsTermoBusca || { servico: '', localizacao: '' };

  const renderEstrelas = (avaliacao) => {
    const estrelas = [];
    const avaliacaoInt = Math.floor(avaliacao);
    const temMeiaEstrela = avaliacao % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < avaliacaoInt) {
        estrelas.push(<span key={i} className="estrela cheia">★</span>);
      } else if (i === avaliacaoInt && temMeiaEstrela) {
        estrelas.push(<span key={i} className="estrela meia">★</span>);
      } else {
        estrelas.push(<span key={i} className="estrela vazia">☆</span>);
      }
    }

    return estrelas;
  };

  const handleVoltarBusca = () => {
    if (onVoltarBusca) {
      onVoltarBusca();
    } else {
      navigate('/dashboard');
    }
  };

  const handleVerPerfil = (trabalhador) => {
    if (onVerPerfil) {
      onVerPerfil(trabalhador);
    } else {
      // Navegar para o perfil do trabalhador
      navigate('/perfil', { state: { trabalhador } });
    }
  };

  return (
    <div className="resultados-container">
      <div className="resultados-header">
        <button className="voltar-btn" onClick={handleVoltarBusca}>
          ← Voltar à Busca
        </button>
        <h2>Trabalhadores encontrados</h2>
        <p>
          {resultados.length} profissionais encontrados para "{termoBusca.servico}" 
          {termoBusca.localizacao && ` em ${termoBusca.localizacao}`}
        </p>
      </div>

      <div className="resultados-lista">
        {resultados.map((trabalhador) => (
          <div key={trabalhador.id} className="trabalhador-card">
            <div className="card-foto">
              <img 
                src={trabalhador.foto} 
                alt={`Foto de ${trabalhador.nome}`}
                className="foto-trabalhador"
              />
            </div>
            
            <div className="card-info">
              <h3 className="nome-trabalhador">{trabalhador.nome}</h3>
              
              <div className="avaliacao">
                <div className="estrelas">
                  {renderEstrelas(trabalhador.avaliacao)}
                </div>
                <span className="nota-avaliacao">
                  {trabalhador.avaliacao.toFixed(1)}
                </span>
                <span className="total-avaliacoes">
                  ({trabalhador.totalAvaliacoes} avaliações)
                </span>
              </div>
              
              <div className="habilidades">
                {trabalhador.habilidades.map((habilidade, index) => (
                  <span key={index} className="habilidade-tag">
                    {habilidade}
                  </span>
                ))}
              </div>
              
              <div className="card-footer">
                <div className="preco-info">
                  <span className="preco">A partir de R$ {trabalhador.precoMinimo}</span>
                </div>
                <button 
                  className="ver-perfil-btn"
                  onClick={() => handleVerPerfil(trabalhador)}
                >
                  Ver Perfil e Contratar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resultados.length === 0 && (
        <div className="sem-resultados">
          <h3>Nenhum trabalhador encontrado</h3>
          <p>Tente buscar com outros termos ou em uma localização diferente.</p>
        </div>
      )}
    </div>
  );
};

export default ResultadosBusca;

