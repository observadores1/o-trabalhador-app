// src/pages/PerfilVitrine.js - COM O BOTÃO "VOLTAR" ADICIONADO

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import HeaderEstiloTop from '../components/HeaderEstiloTop';
import EstrelasDisplay from '../components/EstrelasDisplay';
import './PerfilVitrine.css';

const PerfilVitrine = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarPerfilCompleto = async () => {
      if (!id) {
        setError("ID do perfil não fornecido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [perfilRes, estatisticasRes] = await Promise.all([
          supabase.from('perfis_completos').select('*').eq('id', id).single(),
          supabase.from('view_estatisticas_trabalhadores').select('*').eq('trabalhador_id', id).single()
        ]);

        if (perfilRes.error && perfilRes.error.code !== 'PGRST116') throw perfilRes.error;
        if (estatisticasRes.error && estatisticasRes.error.code !== 'PGRST116') throw estatisticasRes.error;

        setPerfil(perfilRes.data);
        setEstatisticas(estatisticasRes.data);

      } catch (e) {
        console.error("Erro detalhado ao carregar perfil completo:", e);
        setError("Ocorreu um erro ao carregar o perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarPerfilCompleto();
  }, [id]);

  const renderBotaoAcao = () => {
    const isOwner = user && user.id === perfil.id;
    if (isOwner) return <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>Editar Meu Perfil</button>;
    return <button className="btn btn-primary" onClick={() => navigate(`/nova-os?trabalhador_id=${perfil.id}`)}>Contratar este Profissional</button>;
  };

  if (isLoading) return <><HeaderEstiloTop showUserActions={false} /><div className="vitrine-container"><p>Carregando perfil...</p></div></>;
  if (error) return <><HeaderEstiloTop showUserActions={false} /><div className="vitrine-container"><p className="error-message">{error}</p></div></>;
  if (!perfil) return <><HeaderEstiloTop showUserActions={false} /><div className="vitrine-container"><p>Este trabalhador não foi encontrado ou não possui um perfil profissional completo.</p></div></>;

  const stats = estatisticas || {};

  return (
    <>
      <HeaderEstiloTop showUserActions={false} />
      <div className="vitrine-container">
        <div className="vitrine-header-info">
          <img 
            src={perfil.foto_perfil_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'} 
            alt={`Foto de ${perfil.apelido}`} 
            className="avatar-padrao"
          />
          <h1>{perfil.apelido}</h1>
          <p className="vitrine-titulo">{perfil.titulo_profissional || 'Trabalhador'}</p>
          <div className="vitrine-avaliacao">
            <EstrelasDisplay nota={stats.media_geral_estrelas} />
            <span className="total-avaliacoes">
              ({stats.total_avaliacoes || 0} {stats.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'}  )
            </span>
          </div>
        </div>

        <main className="vitrine-main">
          <section className="vitrine-section">
            <h2>Sobre Mim</h2>
            <p>{perfil.biografia || 'Nenhuma biografia informada.'}</p>
          </section>

          <section className="vitrine-section">
            <h2>Habilidades</h2>
            <div className="habilidades-container">
              {(perfil.habilidades && perfil.habilidades.length > 0) ? (
                perfil.habilidades.map(habilidade => <span key={habilidade} className="habilidade-tag">{habilidade}</span>)
              ) : <p>Nenhuma habilidade informada.</p>}
            </div>
          </section>

          {stats.total_avaliacoes > 0 && (
            <section className="vitrine-section">
              <h2>Avaliações Detalhadas</h2>
              <div className="estatisticas-grid">
                <div className="quesito-media"><span>Pontualidade:</span> <EstrelasDisplay nota={stats.media_pontualidade} /></div>
                <div className="quesito-media"><span>Comunicação:</span> <EstrelasDisplay nota={stats.media_comunicacao} /></div>
                <div className="quesito-media"><span>Atenção ao Cliente:</span> <EstrelasDisplay nota={stats.media_atencao_cliente} /></div>
                <div className="quesito-media"><span>Atenção aos Detalhes:</span> <EstrelasDisplay nota={stats.media_atencao_detalhes} /></div>
                <div className="quesito-media"><span>Organização:</span> <EstrelasDisplay nota={stats.media_organizacao} /></div>
                <div className="quesito-media"><span>Velocidade de Execução:</span> <EstrelasDisplay nota={stats.media_velocidade_execucao} /></div>
                <div className="quesito-media"><span>Proatividade:</span> <EstrelasDisplay nota={stats.media_proatividade} /></div>
              </div>

              <h3 style={{marginTop: '30px'}}>Comentários de Clientes</h3>
              <div className="lista-comentarios">
                {stats.todas_avaliacoes.map((avaliacao, index) => (
                  <div key={index} className="comentario-card">
                    <p>"{avaliacao.comentario}"</p>
                    <small>— Avaliado em {new Date(avaliacao.data).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>

        {/* ================== ALTERAÇÃO AQUI ================== */}
        <footer className="vitrine-footer">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Voltar
          </button>
          {renderBotaoAcao()}
        </footer>
        {/* ==================================================== */}
      </div>
    </>
  );
};

export default PerfilVitrine;
