/**
 * @file PerfilProfissional.js
 * @description Página para o usuário trabalhador editar seu perfil completo.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import FormularioEndereco from './components/FormularioEndereco'; 
import SeletorDeHabilidades from './components/SeletorDeHabilidades';
import GerenciadorDeFoto from './components/GerenciadorDeFoto';
import HeaderEstiloTop from './components/HeaderEstiloTop';
import './PerfilProfissional.css';

// Seus sub-componentes, 100% preservados
const SecaoInfoPessoais = ({ register, control, errors }) => (
    <div className="form-section">
      <h2>Informações Pessoais</h2>
      <div className="form-group">
        <label htmlFor="apelido">Apelido/Nome de Exibição</label>
        <input {...register('apelido', { required: 'Apelido é obrigatório' })} />
        {errors.apelido && <span className="error-message">{errors.apelido.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="telefone">Telefone</label>
        <Controller
          name="telefone"
          control={control}
          render={({ field }) => (
            <IMaskInput
              mask="(00) 00000-0000"
              value={field.value || ''}
              onAccept={(value) => field.onChange(value)}
              placeholder="(XX) XXXXX-XXXX"
              className={errors.telefone ? "error" : ""}
            />
          )}
        />
      </div>
    </div>
  );
  
  const SecaoPerfilProfissional = ({ register }) => (
    <div className="form-section">
      <h2>Perfil Profissional</h2>
      <div className="form-group">
        <label htmlFor="titulo_profissional">Título Profissional</label>
        <input {...register('titulo_profissional')} placeholder="Ex: Eletricista Residencial" />
      </div>
      <div className="form-group">
        <label htmlFor="biografia">Sobre Mim</label>
        <textarea {...register('biografia')} rows="5" placeholder="Descreva sua experiência..."></textarea>
      </div>
    </div>
  );
  
  const SecaoDisponibilidade = ({ register }) => (
    <div className="form-section">
      <h2>Disponibilidade</h2>
      <label>
        <input type="checkbox" {...register('disponivel_para_servicos')} />
        Estou disponível para novos serviços
      </label>
    </div>
  );

// Componente Principal
const PerfilProfissional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    control, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      apelido: '',
      telefone: '',
      endereco: { rua: '', numero: '', bairro: '', cidade: '', estado: '' },
      titulo_profissional: '',
      biografia: '',
      habilidades: [],
      disponivel_para_servicos: true,
      foto_perfil_url: null
    }
  });

  // Lógica de carregamento preservada
  useEffect(() => {
    const carregarDados = async () => {
      if (!user) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const { data: perfilData, error } = await supabase.from('perfis').select(`*, perfis_profissionais!left(*)`).eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (perfilData) {
          setValue('apelido', perfilData.apelido || '');
          setValue('telefone', perfilData.telefone || '');
          setValue('foto_perfil_url', perfilData.foto_perfil_url || null);
          const endereco = perfilData.endereco || {};
          setValue('endereco.rua', endereco.rua || '');
          setValue('endereco.numero', endereco.numero || '');
          setValue('endereco.bairro', endereco.bairro || '');
          setValue('endereco.cidade', endereco.cidade || '');
          setValue('endereco.estado', endereco.estado || '');
          const profissionalData = perfilData.perfis_profissionais || {};
          setValue('titulo_profissional', profissionalData.titulo_profissional || '');
          setValue('biografia', profissionalData.biografia || '');
          const { data: habilidadesData } = await supabase.from('habilidades_do_usuario').select('habilidades(nome)').eq('perfil_id', profissionalData.perfil_id || user.id);
          setValue('habilidades', habilidadesData ? habilidadesData.map(h => h.habilidades.nome) : []);
          setValue('disponivel_para_servicos', profissionalData.disponivel_para_servicos ?? true);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do perfil:", e);
        alert("Não foi possível carregar seus dados. Tente recarregar a página.");
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, [user, setValue]);

  // onSubmit drasticamente simplificado para usar a função RPC
  const onSubmit = async (data) => {
    if (!user) return;
    setIsSaving(true);
    try {
      // 1. ATUALIZAÇÃO DA TABELA 'perfis' (dados não profissionais)
      // Isso continua separado pois pertence a uma tabela diferente.
      const { error: perfilError } = await supabase.from('perfis').update({
        apelido: data.apelido,
        telefone: data.telefone,
        endereco: data.endereco,
        foto_perfil_url: data.foto_perfil_url,
        atualizado_em: new Date().toISOString()
      }).eq('id', user.id);

      if (perfilError) throw perfilError;

      // 2. CHAMADA DA FUNÇÃO RPC PARA ATUALIZAR O RESTO DE UMA VEZ
      const { error: rpcError } = await supabase.rpc('atualizar_perfil_profissional_e_habilidades', {
        p_perfil_id: user.id,
        p_titulo: data.titulo_profissional,
        p_biografia: data.biografia,
        p_disponivel: data.disponivel_para_servicos,
        p_habilidades_nomes: data.habilidades || []
      });

      if (rpcError) throw rpcError;

      alert('✅ Perfil atualizado com sucesso!');
      navigate(`/perfil/${user.id}`);
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      alert(`❌ Erro ao salvar. Tente novamente. Detalhes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="perfil-container"><p>Carregando...</p></div>;

  // JSX com o "Estilo Top"
  return (
    <div className="page-container">
      <HeaderEstiloTop showUserActions={false} />
      <main className="main-content">
        <div className="perfil-container">
          <h1>Editar Meu Perfil</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
            
            <SecaoInfoPessoais register={register} control={control} errors={errors} />

            <div className="form-section">
              <h2>Endereço</h2>
              <FormularioEndereco 
                register={register} 
                watch={watch} 
                setValue={setValue} 
              />
            </div>

            <div className="form-section">
              <h2>Foto do Perfil</h2>
              <GerenciadorDeFoto
                watch={watch}
                setValue={setValue}
              />
            </div>

            <SecaoPerfilProfissional register={register} />

            <div className="form-section">
              <h2>Minhas Habilidades</h2>
              <SeletorDeHabilidades
                watch={watch}
                setValue={setValue}
              />
            </div>

            <SecaoDisponibilidade register={register} />

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PerfilProfissional;
