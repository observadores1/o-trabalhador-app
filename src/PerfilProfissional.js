import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from './services/supabaseClient';
import './PerfilProfissional.css';

// Dados simulados do trabalhador (mockados)
const dadosSimulados = {
  id: 1,
  nome: "João Silva",
  email: "joao.silva@email.com",
  telefone: "(11) 99999-9999",
  biografia: "Sou um profissional experiente com mais de 10 anos de atuação no mercado. Trabalho com dedicação e qualidade em todos os projetos, sempre buscando a satisfação total do cliente.",
  habilidades: ['Pintor', 'Eletricista'],
  disponivel: true,
  fotoPerfil: null,
  avaliacaoMedia: 4.8,
  totalServicos: 127,
  dataUltimaAtualizacao: new Date().toISOString()
};

const PerfilProfissional = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dadosTrabalhador, setDadosTrabalhador] = useState(dadosSimulados);

  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      biografia: dadosTrabalhador.biografia,
      habilidades: dadosTrabalhador.habilidades,
      disponivel: dadosTrabalhador.disponivel,
      fotoPerfil: dadosTrabalhador.fotoPerfil
    }
  });

  // Lista simulada de todas as habilidades disponíveis
  const habilidadesDisponiveis = [
    'Pintor',
    'Eletricista', 
    'Encanador',
    'Jardineiro',
    'Pedreiro',
    'Marceneiro',
    'Soldador',
    'Mecânico',
    'Limpeza',
    'Cozinheiro',
    'Babá',
    'Cuidador de Idosos'
  ];

  // Carrega dados do perfil do Supabase
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      
      try {
        // Simula um usuário logado (ID fixo para teste)
        const userId = 1; // Em produção, isso viria do contexto de autenticação
        
        // Busca dados do perfil nas tabelas perfis e perfis_profissionais
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single();

        const { data: perfilProfissionalData, error: perfilProfissionalError } = await supabase
          .from('perfis_profissionais')
          .select('*')
          .eq('perfil_id', userId)
          .single();

        if (perfilError && perfilError.code !== 'PGRST116') {
          console.error('Erro ao carregar perfil:', perfilError);
        }

        if (perfilProfissionalError && perfilProfissionalError.code !== 'PGRST116') {
          console.error('Erro ao carregar perfil profissional:', perfilProfissionalError);
        }

        // Combina os dados ou usa valores padrão
        const dadosCarregados = {
          ...dadosSimulados,
          ...perfilData,
          ...perfilProfissionalData,
          biografia: perfilProfissionalData?.biografia || '',
          habilidades: perfilProfissionalData?.habilidades || [],
          disponivel: perfilProfissionalData?.disponivel ?? true
        };

        setDadosTrabalhador(dadosCarregados);
        
        // Atualiza os valores do formulário com os dados carregados
        setValue('biografia', dadosCarregados.biografia);
        setValue('habilidades', dadosCarregados.habilidades);
        setValue('disponivel', dadosCarregados.disponivel);
        setValue('fotoPerfil', dadosCarregados.fotoPerfil);
        
      } catch (error) {
        console.error('Erro inesperado ao carregar dados:', error);
        // Em caso de erro, usa dados simulados
        setValue('biografia', dadosSimulados.biografia);
        setValue('habilidades', dadosSimulados.habilidades);
        setValue('disponivel', dadosSimulados.disponivel);
        setValue('fotoPerfil', dadosSimulados.fotoPerfil);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [setValue]);

  // Função para salvar os dados no Supabase
  const onSubmit = async (data) => {
    setIsSaving(true);
    
    try {
      // Simula um usuário logado (ID fixo para teste)
      const userId = 1; // Em produção, isso viria do contexto de autenticação
      
      // Prepara os dados para salvar na tabela perfis_profissionais
      const dadosParaSalvar = {
        perfil_id: userId,
        biografia: data.biografia,
        habilidades: data.habilidades,
        disponivel: data.disponivel,
        updated_at: new Date().toISOString()
      };
      
      // Usa upsert para inserir ou atualizar os dados
      const { data: dadosSalvos, error } = await supabase
        .from('perfis_profissionais')
        .upsert(dadosParaSalvar, {
          onConflict: 'perfil_id'
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Atualiza os dados locais com os dados salvos
      const dadosAtualizados = {
        ...dadosTrabalhador,
        ...dadosSalvos,
        dataUltimaAtualizacao: dadosSalvos.updated_at
      };
      
      setDadosTrabalhador(dadosAtualizados);
      
      console.log('Dados salvos no Supabase:', dadosSalvos);
      alert('✅ Perfil atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      alert('❌ Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para gerenciar mudanças nas habilidades
  const handleHabilidadeChange = (habilidade, isChecked) => {
    const habilidadesAtuais = watch('habilidades') || [];
    if (isChecked) {
      setValue('habilidades', [...habilidadesAtuais, habilidade], { shouldDirty: true });
    } else {
      setValue('habilidades', habilidadesAtuais.filter(h => h !== habilidade), { shouldDirty: true });
    }
  };

  const habilidadesSelecionadas = watch('habilidades') || [];

  // Loading state durante carregamento inicial
  if (isLoading) {
    return (
      <div className="perfil-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Meu Perfil Profissional</h1>
        <p>Gerencie suas informações e disponibilidade</p>
        <div className="perfil-stats">
          <div className="stat-item">
            <span className="stat-number">⭐ {dadosTrabalhador.avaliacaoMedia}</span>
            <span className="stat-label">Avaliação</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{dadosTrabalhador.totalServicos}</span>
            <span className="stat-label">Serviços</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        
        {/* Seção da Foto de Perfil */}
        <div className="form-section">
          <h2>Foto do Perfil</h2>
          <div className="foto-perfil-container">
            <div className="foto-preview">
              <div className="foto-placeholder">
                <span>📷</span>
                <p>Clique para adicionar foto</p>
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              {...register('fotoPerfil')}
              className="foto-input"
            />
          </div>
        </div>

        {/* Seção da Biografia */}
        <div className="form-section">
          <h2>Sobre Mim</h2>
          <textarea
            {...register('biografia', { 
              required: 'A biografia é obrigatória',
              minLength: {
                value: 50,
                message: 'A biografia deve ter pelo menos 50 caracteres'
              },
              maxLength: {
                value: 500,
                message: 'A biografia deve ter no máximo 500 caracteres'
              }
            })}
            placeholder="Conte um pouco sobre sua experiência profissional..."
            className={`biografia-textarea ${errors.biografia ? 'error' : ''}`}
            rows="6"
          />
          {errors.biografia && (
            <span className="error-message">{errors.biografia.message}</span>
          )}
          <div className="char-counter">
            {watch('biografia')?.length || 0}/500 caracteres
          </div>
        </div>

        {/* Seção das Habilidades */}
        <div className="form-section">
          <h2>Minhas Habilidades</h2>
          <p className="section-description">
            Selecione todas as habilidades que você possui ({habilidadesSelecionadas.length} selecionadas):
          </p>
          <div className="habilidades-grid">
            {habilidadesDisponiveis.map((habilidade) => (
              <label key={habilidade} className="habilidade-item">
                <input
                  type="checkbox"
                  checked={habilidadesSelecionadas.includes(habilidade)}
                  onChange={(e) => handleHabilidadeChange(habilidade, e.target.checked)}
                  className="habilidade-checkbox"
                />
                <span className="habilidade-label">{habilidade}</span>
              </label>
            ))}
          </div>
          {habilidadesSelecionadas.length === 0 && (
            <span className="error-message">Selecione pelo menos uma habilidade</span>
          )}
        </div>

        {/* Seção de Disponibilidade */}
        <div className="form-section">
          <h2>Disponibilidade</h2>
          <div className="disponibilidade-container">
            <label className="switch-container">
              <input
                type="checkbox"
                {...register('disponivel')}
                className="switch-input"
              />
              <span className="switch-slider"></span>
              <span className="switch-label">
                {watch('disponivel') ? 'Estou disponível para novos serviços' : 'Não estou disponível no momento'}
              </span>
            </label>
          </div>
          <p className="availability-note">
            {watch('disponivel') 
              ? '✅ Seu perfil será exibido nas buscas de clientes' 
              : '⏸️ Seu perfil ficará oculto temporariamente'
            }
          </p>
        </div>

        {/* Indicador de mudanças não salvas */}
        {isDirty && (
          <div className="unsaved-changes">
            ⚠️ Você tem alterações não salvas
          </div>
        )}

        {/* Botão de Salvar */}
        <div className="form-actions">
          <button 
            type="submit" 
            className={`btn-salvar ${isSaving ? 'saving' : ''}`}
            disabled={isSaving || habilidadesSelecionadas.length === 0}
          >
            {isSaving ? (
              <>
                <span className="loading-spinner-small"></span>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PerfilProfissional;

