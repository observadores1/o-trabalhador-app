/**
 * @file PerfilVitrine.js
 * @description Componente para exibir o perfil público (vitrine) de um trabalhador.
 * @author Jeferson Gnoatto
 * @date 2025-09-25
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import HeaderEstiloTop from './HeaderEstiloTop'; // <-- IMPORTAÇÃO ADICIONADA
import './PerfilVitrine.css';

const PerfilVitrine = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // A função handleGoBack não é mais necessária, pois o HeaderEstiloTop cuidará disso.

  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarPerfil = async () => {
      if (!id) {
        setError("ID do perfil não fornecido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('perfis')
          .select(`
            id,
            apelido,
            foto_perfil_url,
            perfis_profissionais!inner(
              titulo_profissional,
              biografia,
              habilidades,
              avaliacao_media
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setPerfil(null);
          } else {
            throw fetchError;
          }
        } else {
          setPerfil(data);
        }
      } catch (e) {
        console.error("Erro detalhado ao carregar perfil:", e);
        setError("Ocorreu um erro ao carregar o perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarPerfil();
  }, [id]);

  const renderBotaoAcao = () => {
    const isOwner = user && user.id === perfil.id;

    if (isOwner) {
      return (
        <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>
          Editar Meu Perfil
        </button>
      );
    }
    
    return (
      <button 
        className="btn btn-primary" 
        onClick={() => navigate(`/nova-os?trabalhador_id=${perfil.id}`)}
      >
        Contratar este Profissional
      </button>
    );
  };

  if (isLoading) {
    return (
        <>
            <HeaderEstiloTop showUserActions={false} />
            <div className="vitrine-container"><p>Carregando perfil...</p></div>
        </>
    );
  }

  if (error) {
    return (
        <>
            <HeaderEstiloTop showUserActions={false} />
            <div className="vitrine-container"><p className="error-message">{error}</p></div>
        </>
    );
  }

  if (!perfil || !perfil.perfis_profissionais) {
    return (
        <>
            <HeaderEstiloTop showUserActions={false} />
            <div className="vitrine-container"><p>Este trabalhador não foi encontrado ou não possui um perfil profissional completo.</p></div>
        </>
    );
  }

  const dadosProfissionais = perfil.perfis_profissionais;

  return (
    <>
      {/* ================== CORREÇÃO APLICADA AQUI ================== */}
      <HeaderEstiloTop showUserActions={false} />

      <div className="vitrine-container">
        {/* As informações do cabeçalho local foram movidas para cá */}
        <div className="vitrine-header-info">
          <img 
            src={perfil.foto_perfil_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'} 
            alt={`Foto de ${perfil.apelido}`} 
            className="avatar-padrao"
          />
          <h1>{perfil.apelido}</h1>
          <p className="vitrine-titulo">{dadosProfissionais.titulo_profissional || 'Trabalhador'}</p>
          <div className="vitrine-avaliacao">
            ⭐ {dadosProfissionais.avaliacao_media ? Number(dadosProfissionais.avaliacao_media  ).toFixed(1) : 'N/A'}
          </div>
        </div>

        <main className="vitrine-main">
          <section className="vitrine-section">
            <h2>Sobre Mim</h2>
            <p>{dadosProfissionais.biografia || 'Nenhuma biografia informada.'}</p>
          </section>

          <section className="vitrine-section">
            <h2>Habilidades</h2>
            <div className="habilidades-container">
              {(dadosProfissionais.habilidades && dadosProfissionais.habilidades.length > 0 ) ? (
                dadosProfissionais.habilidades.map(habilidade => (
                  <span key={habilidade} className="habilidade-tag">{habilidade}</span>
                ))
              ) : (
                <p>Nenhuma habilidade informada.</p>
              )}
            </div>
          </section>
        </main>

        <footer className="vitrine-footer">
          {renderBotaoAcao()}
        </footer>
      </div>
    </>
  );
};

export default PerfilVitrine;
