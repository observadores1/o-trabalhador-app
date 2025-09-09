import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const PerfilVitrine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Usar o hook de autenticação real
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('perfis') // Assumindo que a tabela principal de perfis se chama 'perfis'
          .select(`
            *,
            perfis_profissionais (*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return <div>Carregando perfil...</div>;
  }

  if (error) {
    return <div>Erro ao carregar perfil: {error}</div>;
  }

  if (!profile) {
    return <div>Perfil não encontrado.</div>;
  }

  // Condição 1: Disponibilidade
  if (!profile.disponivel_para_servicos) {
    return <div>Este trabalhador não está disponível no momento.</div>;
  }

  // Condição 2: Dono do Perfil
  const isOwner = user && user.id === profile.id; // Comparar com o ID do perfil

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Perfil de {profile.apelido}</h1>
      
      {profile.foto_perfil_url && (
        <img 
          src={profile.foto_perfil_url} 
          alt="Foto de Perfil" 
          style={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '20px'
          }} 
        />
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Título Profissional:</strong> {profile.titulo_profissional}</p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Biografia:</strong> {profile.biografia}</p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Habilidades:</strong> {
          profile.perfis_profissionais?.habilidades 
            ? profile.perfis_profissionais.habilidades.join(', ') 
            : 'Nenhuma habilidade listada'
        }</p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Avaliação Média:</strong> {profile.perfis_profissionais?.avaliacao_media || 'N/A'}</p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Localização:</strong> {profile.cidade}, {profile.bairro}</p>
      </div>

      {isOwner && (
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => navigate('/perfil/editar')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Editar Perfil
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Voltar ao Painel
          </button>
        </div>
      )}

      {/* Condição 3: Visualização do Contratante - Exibição dos dados */}
      {!isOwner && (
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Voltar à Busca
          </button>
        </div>
      )}
    </div>
  );
};

export default PerfilVitrine;

