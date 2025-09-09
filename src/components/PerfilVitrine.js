import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// TODO: Substituir por AuthContext real
const useAuth = () => {
  // Placeholder para o usuário logado
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simula um usuário logado para testes
    // Em um ambiente real, isso viria do seu AuthContext
    setUser({ id: 'some_logged_in_user_id' }); 
  }, []);

  return { user };
};

const supabaseUrl = 'https://symhidyfzvefhrnsloay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWhpZHlmenZlZmhybnNsb2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzM3MjgsImV4cCI6MjA3MjQwOTcyOH0.v1fdNe4AqMZ9Pxc2Bi2_1E0534bqt_rOKIYBTF19EHQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PerfilVitrine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Usar o hook de autenticação
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
  const isOwner = user && user.id === profile.id; // Comparar com o ID do perfil, não do perfis_profissionais

  return (
    <div>
      <h1>Perfil de {profile.apelido}</h1>
      {profile.foto_perfil_url && <img src={profile.foto_perfil_url} alt="Foto de Perfil" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />}
      <p><strong>Título Profissional:</strong> {profile.titulo_profissional}</p>
      <p><strong>Biografia:</strong> {profile.biografia}</p>
      <p><strong>Habilidades:</strong> {profile.perfis_profissionais?.habilidades ? profile.perfis_profissionais.habilidades.join(', ') : 'Nenhuma habilidade listada'}</p>
      <p><strong>Avaliação Média:</strong> {profile.perfis_profissionais?.avaliacao_media || 'N/A'}</p>
      <p><strong>Localização:</strong> {profile.cidade}, {profile.bairro}</p>

      {isOwner && (
        <div>
          <button onClick={() => navigate('/perfil/editar')}>Editar Perfil</button>
          <button onClick={() => navigate('/dashboard')}>Voltar ao Painel</button>
        </div>
      )}

      {/* Condição 3: Visualização do Contratante - Exibição dos dados */}
      {!isOwner && (
        <div>
          {/* Dados já exibidos acima, mas aqui é onde você adicionaria mais elementos de visualização para contratantes */}
        </div>
      )}
    </div>
  );
};

export default PerfilVitrine;


