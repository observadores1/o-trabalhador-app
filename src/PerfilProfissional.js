import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import imageCompression from 'browser-image-compression';
import FormularioEndereco from './components/FormularioEndereco'; 
import './PerfilProfissional.css';

const PerfilProfissional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listaDeHabilidades, setListaDeHabilidades] = useState([]);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    control, 
    formState: { errors, isDirty } 
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

  useEffect(() => {
    const buscarHabilidades = async () => {
      const { data, error } = await supabase.from('habilidades').select('nome').order('nome', { ascending: true });
      if (data) setListaDeHabilidades(data);
    };
    buscarHabilidades();
  }, []);

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

  const handleFotoUpload = async (event) => {
    if (!user) return;
    const file = event.target.files[0]; // Alterado de event.target.files para event.target.files[0]
    if (!file) return;
    setIsSaving(true);
    const fotoAntigaUrl = watch('foto_perfil_url');
    const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(file, options);
      const novoFilePath = `public/${user.id}-${Date.now()}`;
      await supabase.storage.from("fotos-de-perfil").upload(novoFilePath, compressedFile);
      if (fotoAntigaUrl) {
        const nomeArquivoAntigo = fotoAntigaUrl.split('/').pop();
        if (nomeArquivoAntigo) {
          await supabase.storage.from('fotos-de-perfil').remove([`public/${nomeArquivoAntigo}`]);
        }
      }
      const { data: { publicUrl } } = supabase.storage.from("fotos-de-perfil").getPublicUrl(novoFilePath);
      setValue("foto_perfil_url", publicUrl, { shouldDirty: true });
      alert("✅ Foto atualizada! Clique em 'Salvar Alterações' para confirmar.");
    } catch (error) {
      console.error("Erro no processo de atualização da foto:", error);
      alert("❌ Erro ao atualizar a foto. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHabilidadeChange = (habilidade, isChecked) => {
    const habilidadesAtuais = watch('habilidades') || [];
    if (isChecked) {
      setValue('habilidades', [...habilidadesAtuais, habilidade], { shouldDirty: true });
    } else {
      setValue('habilidades', habilidadesAtuais.filter(h => h !== habilidade), { shouldDirty: true });
    }
  };

  if (isLoading) return <div className="perfil-container"><p>Carregando...</p></div>;

  return (
    <div className="perfil-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">← Voltar</button>
      <h1>Editar Meu Perfil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        
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
          {watch('foto_perfil_url') && (
            <img 
              src={watch('foto_perfil_url')} 
              alt="Prévia da foto" 
              className="foto-preview"
            />
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFotoUpload} 
            id="foto-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="foto-upload" className="btn btn-secondary">
            {isSaving ? 'Enviando...' : 'Escolher Nova Foto'}
          </label>
        </div>

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

        <div className="form-section">
          <h2>Minhas Habilidades</h2>
          <div className="habilidades-grid">
            {listaDeHabilidades.map((habilidade) => (
              <label key={habilidade.nome} className="habilidade-item">
                <input
                  type="checkbox"
                  value={habilidade.nome}
                  checked={(watch('habilidades') || []).includes(habilidade.nome)}
                  onChange={(e) => handleHabilidadeChange(habilidade.nome, e.target.checked)}
                />
                {habilidade.nome}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Disponibilidade</h2>
          <label>
            <input type="checkbox" {...register('disponivel_para_servicos')} />
            Estou disponível para novos serviços
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving || !isDirty}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilProfissional;


