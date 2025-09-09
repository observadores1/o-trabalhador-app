import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useIMask } from 'react-imask'; // Importando a biblioteca correta
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import './PerfilProfissional.css';

const PerfilProfissional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      apelido: '',
      telefone: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: ''
      },
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
    'Babá', 'Cuidador de Idosos', 'Faxineiro'
  ];

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select(`
            *,
            perfis_profissionais (
              titulo_profissional,
              biografia,
              habilidades,
              disponivel_para_servicos
            )
          `)
          .eq('id', user.id)
          .single();

        if (perfilError && perfilError.code !== 'PGRST116') { // Ignora erro se perfil profissional não existe
          throw perfilError;
        }

        if (perfilData) {
          // Usando setTimeout para garantir que o form esteja pronto
          setTimeout(() => {
            setValue('apelido', perfilData.apelido || '');
            setValue('telefone', perfilData.telefone || '');
            setValue('foto_perfil_url', perfilData.foto_perfil_url || null);

            if (perfilData.endereco) {
              setValue('endereco.rua', perfilData.endereco.rua || '');
              setValue('endereco.numero', perfilData.endereco.numero || '');
              setValue('endereco.bairro', perfilData.endereco.bairro || '');
              setValue('endereco.cidade', perfilData.endereco.cidade || '');
            }

            const perfilProf = perfilData.perfis_profissionais?.[0];
            if (perfilProf) {
              setValue('titulo_profissional', perfilProf.titulo_profissional || '');
              setValue('biografia', perfilProf.biografia || '');
              setValue('habilidades', perfilProf.habilidades || []);
              setValue('disponivel_para_servicos', perfilProf.disponivel_para_servicos ?? true);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
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
      const { error: perfilError } = await supabase
        .from('perfis')
        .update({
          apelido: data.apelido,
          telefone: data.telefone,
          endereco: data.endereco,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (perfilError) throw perfilError;
      
      const dadosPerfilProfissional = {
        perfil_id: user.id,
        titulo_profissional: data.titulo_profissional,
        biografia: data.biografia,
        habilidades: data.habilidades,
        disponivel_para_servicos: data.disponivel_para_servicos,
        atualizado_em: new Date().toISOString()
      };
      
      const { error: perfilProfissionalError } = await supabase
        .from('perfis_profissionais')
        .upsert(dadosPerfilProfissional);
      
      if (perfilProfissionalError) throw perfilProfissionalError;
      
      alert('✅ Perfil atualizado com sucesso!');
      navigate(`/perfil/${user.id}`); // Redireciona para a vitrine após salvar
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      alert('❌ Erro ao salvar. Tente novamente.');
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

  const handleFotoUpload = async (event) => {
    if (!user) return;
    const file = event.target.files[0];
    if (!file) return;

    setIsSaving(true);
    try {
      // Deleta a foto antiga, se existir
      const oldUrl = watch('foto_perfil_url');
      if (oldUrl) {
        const oldPath = oldUrl.split('/').pop();
        await supabase.storage.from('fotos-de-perfil').remove([`public/${oldPath}`]);
      }

      const { data, error } = await supabase.storage
        .from("fotos-de-perfil")
        .upload(`public/${user.id}-${Date.now()}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("fotos-de-perfil")
        .getPublicUrl(data.path);

      const { error: updateError } = await supabase
        .from("perfis")
        .update({ foto_perfil_url: publicUrl, atualizado_em: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setValue("foto_perfil_url", publicUrl, { shouldDirty: true });
      alert("✅ Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      alert("❌ Erro ao fazer upload da foto. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const fotoPerfilUrl = watch('foto_perfil_url');
  const habilidadesSelecionadas = watch('habilidades') || [];

  if (isLoading) {
    return <div className="perfil-container"><p>Carregando seu perfil...</p></div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <button onClick={() => navigate(-1)} className="back-button">← Voltar</button>
        <h1>Editar Perfil Profissional</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        
        <div className="form-section">
          <h2>Informações Pessoais</h2>
          <div className="foto-perfil-container">
            <img src={fotoPerfilUrl || 'https://via.placeholder.com/150'} alt="Foto de Perfil" className="foto-preview" />
            <input type="file" accept="image/*" id="foto-upload" className="foto-input" onChange={handleFotoUpload} />
            <label htmlFor="foto-upload" className="foto-upload-label">Trocar Foto</label>
          </div>
          
          <div className="form-group">
            <label htmlFor="apelido">Apelido/Nome de Exibição</label>
            <input {...register('apelido', { required: 'O apelido é obrigatório' } )} />
            {errors.apelido && <span className="error-message">{errors.apelido.message}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <Controller
              name="telefone"
              control={control}
              rules={{ required: "O telefone é obrigatório" }}
              render={({ field }) => {
                const { ref } = useIMask({ mask: '(00) 00000-0000' });
                return <input {...field} ref={ref} type="tel" placeholder="(XX) XXXXX-XXXX" />;
              }}
            />
            {errors.telefone && <span className="error-message">{errors.telefone.message}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Endereço</h2>
          <div className="form-group">
            <label>Rua</label>
            <input {...register('endereco.rua', { required: 'A rua é obrigatória' })} />
            {errors.endereco?.rua && <span className="error-message">{errors.endereco.rua.message}</span>}
          </div>
          {/* Repetir para numero, bairro, cidade */}
        </div>

        <div className="form-section">
          <h2>Sobre Mim</h2>
          <div className="form-group">
            <label>Título Profissional</label>
            <input {...register('titulo_profissional')} placeholder="Ex: Eletricista Residencial" />
          </div>
          <div className="form-group">
            <label>Biografia</label>
            <textarea {...register('biografia', { required: 'A biografia é obrigatória' })} rows="6" />
            {errors.biografia && <span className="error-message">{errors.biografia.message}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Minhas Habilidades</h2>
          <div className="habilidades-grid">
            {habilidadesDisponiveis.map((habilidade) => (
              <label key={habilidade} className="habilidade-item">
                <input
                  type="checkbox"
                  checked={habilidadesSelecionadas.includes(habilidade)}
                  onChange={(e) => handleHabilidadeChange(habilidade, e.target.checked)}
                />
                <span>{habilidade}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Disponibilidade</h2>
          <label className="switch-container">
            <input type="checkbox" {...register('disponivel_para_servicos')} />
            <span className="switch-slider"></span>
            <span className="switch-label">
              {watch('disponivel_para_servicos') ? 'Estou disponível' : 'Não estou disponível'}
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilProfissional;
