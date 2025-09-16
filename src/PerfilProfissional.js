import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask'; // <-- Importação da biblioteca correta
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import SeletorDeLocalizacao from './components/SeletorDeLocalizacao';
import './PerfilProfissional.css';

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

  const habilidadesDisponiveis = [
    'Pintor', 'Eletricista', 'Encanador', 'Jardineiro', 'Pedreiro',
    'Marceneiro', 'Soldador', 'Mecânico', 'Limpeza', 'Cozinheiro',
    'Babá', 'Cuidador de Idosos'
  ];

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data: perfilData, error } = await supabase
          .from('perfis')
          .select(`
            *,
            perfis_profissionais!left(*)
          `)
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (perfilData) {
          // Preenche os dados do perfil principal
          setValue('apelido', perfilData.apelido || '');
          setValue('telefone', perfilData.telefone || '');
          setValue('foto_perfil_url', perfilData.foto_perfil_url || null);

          // Preenche o endereço
          const endereco = perfilData.endereco || {};
          setValue('endereco.rua', endereco.rua || '');
          setValue('endereco.numero', endereco.numero || '');
          setValue('endereco.bairro', endereco.bairro || '');
          setValue('endereco.cidade', endereco.cidade || '');
          setValue('endereco.estado', endereco.estado || '');

          // Preenche os dados do perfil profissional (se existirem)
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
      // Atualiza a tabela 'perfis'
      const { error: perfilError } = await supabase.from('perfis').update({
        apelido: data.apelido,
        telefone: data.telefone,
        endereco: data.endereco,
        foto_perfil_url: data.foto_perfil_url,
        atualizado_em: new Date().toISOString()
      }).eq('id', user.id);

      if (perfilError) throw perfilError;

      // Faz o upsert na tabela 'perfis_profissionais'
      const { error: profissionalError } = await supabase.from('perfis_profissionais').upsert({
        perfil_id: user.id,
        titulo_profissional: data.titulo_profissional,
        biografia: data.biografia,
        habilidades: data.habilidades,
        disponivel_para_servicos: data.disponivel_para_servicos,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'perfil_id' });

      if (profissionalError) throw profissionalError;

      alert('✅ Perfil atualizado com sucesso!');
      navigate(`/perfil/${user.id}`); // Volta para a página de visualização
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      alert('❌ Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFotoUpload = async (event) => {
    if (!user) return;
    const file = event.target.files[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const filePath = `public/${user.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("fotos-de-perfil")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("fotos-de-perfil")
        .getPublicUrl(filePath);

      setValue("foto_perfil_url", publicUrl, { shouldDirty: true });
      alert("✅ Foto pronta para ser salva. Clique em 'Salvar Alterações'.");

    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      alert("❌ Erro ao fazer upload da foto. Tente novamente.");
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

  const handleEstadoChange = (novoEstado) => {
    setValue('endereco.estado', novoEstado, { shouldDirty: true });
  };

  const handleCidadeChange = (novaCidade) => {
    setValue('endereco.cidade', novaCidade, { shouldDirty: true });
  };

  if (isLoading) return <div className="perfil-container"><p>Carregando...</p></div>;

  return (
    <div className="perfil-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">← Voltar</button>
      <h1>Editar Meu Perfil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        
        {/* Seção de Informações Pessoais */}
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

        {/* Seção de Endereço */}
        <div className="form-section">
          <h2>Endereço</h2>
          <div className="form-group">
            <label>Rua</label>
            <input {...register('endereco.rua')} placeholder="Sua rua" />
          </div>
          <div className="form-group">
            <label>Número</label>
            <input {...register('endereco.numero')} placeholder="Nº" />
          </div>
          
          {/* Usando o componente SeletorDeLocalizacao */}
          <SeletorDeLocalizacao
            valorEstado={watch("endereco.estado")}
            valorCidade={watch("endereco.cidade")}
            onEstadoChange={handleEstadoChange}
            onCidadeChange={handleCidadeChange}
          />
          
          <div className="form-group">
            <label>Bairro</label>
            <input {...register('endereco.bairro')} placeholder="Seu bairro" />
          </div>
        </div>

        {/* Seção da Foto de Perfil */}
        <div className="form-section">
          <h2>Foto do Perfil</h2>
          <input type="file" accept="image/*" onChange={handleFotoUpload} />
          {watch('foto_perfil_url') && <img src={watch('foto_perfil_url')} alt="Prévia da foto" style={{ width: '100px', height: '100px', marginTop: '10px' }} />}
        </div>

        {/* Seção Perfil Profissional */}
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

        {/* Seção das Habilidades */}
        <div className="form-section">
          <h2>Minhas Habilidades</h2>
          <div className="habilidades-grid">
            {habilidadesDisponiveis.map((habilidade) => (
              <label key={habilidade} className="habilidade-item">
                <input
                  type="checkbox"
                  value={habilidade}
                  checked={(watch('habilidades') || []).includes(habilidade)}
                  onChange={(e) => handleHabilidadeChange(habilidade, e.target.checked)}
                />
                {habilidade}
              </label>
            ))}
          </div>
        </div>

        {/* Seção de Disponibilidade */}
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

