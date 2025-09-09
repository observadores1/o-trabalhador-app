import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask'; // Importando o componente correto
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import './PerfilProfissional.css';

// Componente separado para a máscara, para seguir as regras dos Hooks
const PhoneMaskedInput = React.forwardRef((props, ref) => {
  return (
    <IMaskInput
      {...props}
      mask="(00) 00000-0000"
      inputRef={ref}
      placeholder="(XX) XXXXX-XXXX"
    />
  );
});

const PerfilProfissional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
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
    'Babá', 'Cuidador de Idosos', 'Faxineiro'
  ];

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select(`*, perfis_profissionais (titulo_profissional, biografia, habilidades, disponivel_para_servicos)`)
          .eq('id', user.id)
          .single();

        if (perfilError && perfilError.code !== 'PGRST116') throw perfilError;

        if (perfilData) {
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
      // Implementar a lógica de salvar aqui
      alert('Salvando... (lógica a ser implementada)');
      console.log("Dados para salvar:", data);
      // Após salvar, navegar para a vitrine
      // navigate(`/perfil/${user.id}`); 
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // ... (outras funções como handleHabilidadeChange, handleFotoUpload)

  if (isLoading) {
    return <div className="perfil-container"><p>Carregando...</p></div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <button onClick={() => navigate(-1)} className="back-button">← Voltar</button>
        <h1>Editar Perfil</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <Controller
            name="telefone"
            control={control}
            rules={{ required: "O telefone é obrigatório" }}
            render={({ field }) => <PhoneMaskedInput {...field} />}
          />
          {errors.telefone && <span className="error-message">{errors.telefone.message}</span>}
        </div>
        
        {/* Outros campos do formulário aqui */}

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
