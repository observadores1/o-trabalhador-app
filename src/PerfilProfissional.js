import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask'; // <-- Importação da nova biblioteca
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
      endereco: { rua: '', numero: '', bairro: '', cidade: '' },
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
      if (!user) return;
      setIsLoading(true);
      try {
        const { data: perfilData, error } = await supabase
          .from('perfis')
          .select(`*, perfis_profissionais(*)`)
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

          // Preenche os dados do perfil profissional (se existirem)
          const profissionalData = perfilData.perfis_profissionais[0] || {};
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
      await supabase.from('perfis').update({
        apelido: data.apelido,
        telefone: data.telefone,
        endereco: data.endereco,
        foto_perfil_url: data.foto_perfil_url,
        atualizado_em: new Date().toISOString()
      }).eq('id', user.id);

      // Faz o upsert na tabela 'perfis_profissionais'
      await supabase.from('perfis_profissionais').upsert({
        perfil_id: user.id,
        titulo_profissional: data.titulo_profissional,
        biografia: data.biografia,
        habilidades: data.habilidades,
        disponivel_para_servicos: data.disponivel_para_servicos,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'perfil_id' });

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
    // ... (lógica de upload de foto permanece a mesma)
  };

  const handleHabilidadeChange = (habilidade, isChecked) => {
    const habilidadesAtuais = watch('habilidades') || [];
    if (isChecked) {
      setValue('habilidades', [...habilidadesAtuais, habilidade], { shouldDirty: true });
    } else {
      setValue('habilidades', habilidadesAtuais.filter(h => h !== habilidade), { shouldDirty: true });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="perfil-container">
      <button onClick={() => navigate(-1)} className="back-button">← Voltar</button>
      <h1>Editar Meu Perfil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        {/* ... (seções de foto, apelido, endereço, etc.) ... */}
        
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="(00) 00000-0000"
                value={field.value}
                onAccept={(value) => field.onChange(value)}
                placeholder="(XX) XXXXX-XXXX"
                className={errors.telefone ? "error" : ""}
              />
            )}
          />
        </div>

        {/* ... (seções de biografia, habilidades, disponibilidade, etc.) ... */}

        <div className="form-actions">
          <button type="submit" disabled={isSaving || !isDirty}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilProfissional;
