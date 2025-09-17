    // src/PerfilProfissional.js - VERSÃO FINAL PÓS-REATORAÇÃO R4
    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useForm, Controller } from 'react-hook-form';
    import { IMaskInput } from 'react-imask';
    import { supabase } from './services/supabaseClient';
    import { useAuth } from './contexts/AuthContext';
    import FormularioEndereco from './components/FormularioEndereco'; 
    import SeletorDeHabilidades from './components/SeletorDeHabilidades';
    import GerenciadorDeFoto from './components/GerenciadorDeFoto';
    import './PerfilProfissional.css';

    // ===================================================================
    // 1. DEFINIÇÃO DOS SUB-COMPONENTES INTERNOS (Stateless)
    // ===================================================================

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

    // ===================================================================
    // 2. COMPONENTE PRINCIPAL (Container) - Agora muito mais limpo
    // ===================================================================

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

      // A lógica de carregar dados e submeter o formulário permanece inalterada.
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
              setValue('habilidades', profissionalData.habilidades || []);
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

      const onSubmit = async (data) => {
        if (!user) return;
        setIsSaving(true);
        try {
          await supabase.from('perfis').update({
            apelido: data.apelido,
            telefone: data.telefone,
            endereco: data.endereco,
            foto_perfil_url: data.foto_perfil_url,
            atualizado_em: new Date().toISOString()
          }).eq('id', user.id);

          await supabase.from('habilidades_do_usuario').delete().eq('perfil_id', user.id);

          if (data.habilidades && data.habilidades.length > 0) {
            const { data: idsHabilidades } = await supabase.from('habilidades').select('id').in('nome', data.habilidades);
            const novasHabilidadesParaSalvar = idsHabilidades.map(item => ({ perfil_id: user.id, habilidade_id: item.id }));
            if (novasHabilidadesParaSalvar.length > 0) {
              await supabase.from('habilidades_do_usuario').insert(novasHabilidadesParaSalvar);
            }
          }

          await supabase.from('perfis_profissionais').upsert({
            perfil_id: user.id,
            titulo_profissional: data.titulo_profissional,
            biografia: data.biografia,
            disponivel_para_servicos: data.disponivel_para_servicos,
            atualizado_em: new Date().toISOString()
          }, { onConflict: 'perfil_id' });

          alert('✅ Perfil atualizado com sucesso!');
          navigate(`/perfil/${user.id}`);
        } catch (error) {
          console.error('Erro ao salvar no Supabase:', error);
          alert('❌ Erro ao salvar. Tente novamente.');
        } finally {
          setIsSaving(false);
        }
      };

      if (isLoading) return <div className="perfil-container"><p>Carregando...</p></div>;

      // 3. O JSX principal agora é declarativo e extremamente legível.
      return (
        <div className="perfil-container">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">← Voltar</button>
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
      );
    };

    export default PerfilProfissional;
    

