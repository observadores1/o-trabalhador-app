import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './PerfilVitrine.css';

const PerfilVitrine = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  // Função auxiliar para otimizar URLs de imagem
  const getOptimizedUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'; // Retorna uma imagem padrão se não houver URL
    return `${url}?width=200&height=200&resize=cover`;
  };


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
        // Query corrigida para fazer o JOIN explícito usando perfil_id
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

  if (isLoading) {
    return <div className="vitrine-container"><p>Carregando perfil...</p></div>;
  }

  if (error) {
    return <div className="vitrine-container"><p className="error-message">{error}</p></div>;
  }

  if (!perfil || !perfil.perfis_profissionais) {
    return <div className="vitrine-container"><p>Este trabalhador não foi encontrado ou não possui um perfil profissional completo.</p></div>;
  }

  const isOwner = user && user.id === perfil.id;

  const renderBotaoAcao = () => {
    if (isOwner) {
      return (
        <button className="btn btn-primary" onClick={() => navigate("/perfil/editar")}>
          Editar Meu Perfil
        </button>
      );
    }
    return (
      <button className="btn btn-primary" onClick={() => alert("Lógica de contratação a ser implementada")}>
        Contratar
      </button>
    );
  };

  const dadosProfissionais = perfil.perfis_profissionais;

  return (
    <div className="vitrine-container">
      <button className="btn btn-secondary" onClick={handleGoBack}>← Voltar</button>
      <header className="vitrine-header">
        <img 
          src={getOptimizedUrl(perfil.foto_perfil_url)} 
          alt={`Foto de ${perfil.apelido}`} 
          className="vitrine-foto"
        />
        <h1>{perfil.apelido}</h1>
        <p className="vitrine-titulo">{dadosProfissionais.titulo_profissional || 'Trabalhador'}</p>
        <div className="vitrine-avaliacao">
          ⭐ {dadosProfissionais.avaliacao_media || 'N/A'}
        </div>
      </header>

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
  );
};

export default PerfilVitrine;
