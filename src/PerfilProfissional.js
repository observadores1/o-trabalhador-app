import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import './PerfilProfissional.css';

const PerfilProfissional = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dadosTrabalhador, setDadosTrabalhador] = useState({});

  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      apelido: '',
      telefone: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: ''
      },
      biografia: '',
      habilidades: [],
      disponivel: true,
      fotoPerfil: null
    }
  });

  // Lista de todas as habilidades disponíveis
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

  // Carrega dados do perfil do Supabase com JOIN
  useEffect(() => {
    const carregarDados = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Busca dados do perfil com JOIN para perfis_profissionais
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select(`
            *,
            perfis_profissionais (
              biografia,
              habilidades,
              disponivel,
              atualizado_em
            )
          `)
          .eq('id', user.id)
          .single();

        if (perfilError) {
          console.error('Erro ao carregar perfil:', perfilError);
          return;
        }

        // Processa os dados carregados
        const dadosCarregados = {
          ...perfilData,
          biografia: perfilData.perfis_profissionais?.[0]?.biografia || '',
          habilidades: perfilData.perfis_profissionais?.[0]?.habilidades || [],
          disponivel: perfilData.perfis_profissionais?.[0]?.disponivel ?? true
        };

        setDadosTrabalhador(dadosCarregados);
        
        // Processa o endereço JSONB
        let enderecoObj = { rua: '', numero: '', bairro: '', cidade: '' };
        if (perfilData.endereco) {
          try {
            if (typeof perfilData.endereco === 'string') {
              enderecoObj = JSON.parse(perfilData.endereco);
            } else {
              enderecoObj = perfilData.endereco;
            }
          } catch (e) {
            console.warn('Erro ao processar endereço:', e);
          }
        }
        
        // Atualiza os valores do formulário com os dados carregados
        setValue('apelido', dadosCarregados.apelido || '');
        setValue('telefone', dadosCarregados.telefone || '');
        setValue('endereco.rua', enderecoObj.rua || '');
        setValue('endereco.numero', enderecoObj.numero || '');
        setValue('endereco.bairro', enderecoObj.bairro || '');
        setValue('endereco.cidade', enderecoObj.cidade || '');
        setValue('biografia', dadosCarregados.biografia);
        setValue('habilidades', dadosCarregados.habilidades);
        setValue('disponivel', dadosCarregados.disponivel);
        setValue('fotoPerfil', dadosCarregados.fotoPerfil);
        
      } catch (error) {
        console.error('Erro inesperado ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [user, setValue]);

  // Função para salvar os dados no Supabase usando upsert
  const onSubmit = async (data) => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Prepara o objeto de endereço JSONB
      const enderecoObj = {
        rua: data.endereco.rua,
        numero: data.endereco.numero,
        bairro: data.endereco.bairro,
        cidade: data.endereco.cidade
      };
      
      // Atualiza dados na tabela perfis
      const { error: perfilError } = await supabase
        .from('perfis')
        .update({
          apelido: data.apelido,
          telefone: data.telefone,
          endereco: enderecoObj,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (perfilError) {
        throw perfilError;
      }
      
      // Prepara os dados para salvar na tabela perfis_profissionais usando upsert
      const dadosPerfilProfissional = {
        perfil_id: user.id,
        biografia: data.biografia,
        habilidades: data.habilidades,
        disponivel: data.disponivel,
        atualizado_em: new Date().toISOString()
      };
      
      // Usa upsert para inserir ou atualizar os dados
      const { data: dadosSalvos, error: perfilProfissionalError } = await supabase
        .from('perfis_profissionais')
        .upsert(dadosPerfilProfissional, {
          onConflict: 'perfil_id'
        })
        .select()
        .single();
      
      if (perfilProfissionalError) {
        throw perfilProfissionalError;
      }
      
      // Atualiza os dados locais com os dados salvos
      const dadosAtualizados = {
        ...dadosTrabalhador,
        apelido: data.apelido,
        telefone: data.telefone,
        endereco: enderecoObj,
        ...dadosSalvos,
        dataUltimaAtualizacao: dadosSalvos.atualizado_em
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
            <span className="stat-number">⭐ {dadosTrabalhador.avaliacaoMedia || 'N/A'}</span>
            <span className="stat-label">Avaliação</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{dadosTrabalhador.totalServicos || 0}</span>
            <span className="stat-label">Serviços</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        
        {/* Seção de Informações Pessoais */}
        <div className="form-section">
          <h2>Informações Pessoais</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="apelido">Apelido/Nome de Exibição</label>
              <input
                type="text"
                id="apelido"
                {...register('apelido', { 
                  required: 'O apelido é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'O apelido deve ter pelo menos 2 caracteres'
                  }
                })}
                className={errors.apelido ? 'error' : ''}
                placeholder="Como você gostaria de ser chamado?"
              />
              {errors.apelido && (
                <span className="error-message">{errors.apelido.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                {...register('telefone', { 
                  required: 'O telefone é obrigatório',
                  pattern: {
                    value: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                    message: 'Formato: (11) 99999-9999'
                  }
                })}
                className={errors.telefone ? 'error' : ''}
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && (
                <span className="error-message">{errors.telefone.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Endereço */}
        <div className="form-section">
          <h2>Endereço</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endereco.rua">Rua</label>
              <input
                type="text"
                id="endereco.rua"
                {...register('endereco.rua', { 
                  required: 'A rua é obrigatória'
                })}
                className={errors.endereco?.rua ? 'error' : ''}
                placeholder="Nome da rua"
              />
              {errors.endereco?.rua && (
                <span className="error-message">{errors.endereco.rua.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="endereco.numero">Número</label>
              <input
                type="text"
                id="endereco.numero"
                {...register('endereco.numero', { 
                  required: 'O número é obrigatório'
                })}
                className={errors.endereco?.numero ? 'error' : ''}
                placeholder="123"
              />
              {errors.endereco?.numero && (
                <span className="error-message">{errors.endereco.numero.message}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endereco.bairro">Bairro</label>
              <input
                type="text"
                id="endereco.bairro"
                {...register('endereco.bairro', { 
                  required: 'O bairro é obrigatório'
                })}
                className={errors.endereco?.bairro ? 'error' : ''}
                placeholder="Nome do bairro"
              />
              {errors.endereco?.bairro && (
                <span className="error-message">{errors.endereco.bairro.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="endereco.cidade">Cidade</label>
              <input
                type="text"
                id="endereco.cidade"
                {...register('endereco.cidade', { 
                  required: 'A cidade é obrigatória'
                })}
                className={errors.endereco?.cidade ? 'error' : ''}
                placeholder="Nome da cidade"
              />
              {errors.endereco?.cidade && (
                <span className="error-message">{errors.endereco.cidade.message}</span>
              )}
            </div>
          </div>
        </div>

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

