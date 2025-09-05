import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import { useForm } from 'react-hook-form';
import './PerfilProfissional.css';

const PerfilProfissional = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [mostrarPerfilProfissional, setMostrarPerfilProfissional] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      nome: '',
      biografia: '',
      habilidades: [],
      disponivel: true,
      fotoPerfil: null,
      telefone: '',
      endereco: ''
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

  useEffect(() => {
    const carregarPerfil = async () => {
      setIsLoading(true);
      if (!user) {
        console.error("Usuário não autenticado.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("perfis")
        .select(`
          *,
          perfis_profissionais (*)
        `)
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora erro de "nenhuma linha encontrada"
        console.error("Erro ao carregar perfil:", error);
      } else if (data) {
        const perfilData = {
          ...data,
          ...data.perfis_profissionais,
        };
        setPerfil(perfilData);
        reset(perfilData);
        
        // Verifica se o usuário já é trabalhador ou tem perfil profissional
        const tipoUsuario = data.tipo_usuario;
        const temPerfilProfissional = data.perfis_profissionais && data.perfis_profissionais.length > 0;
        
        if (tipoUsuario === 'trabalhador' || tipoUsuario === 'ambos' || temPerfilProfissional) {
          setMostrarPerfilProfissional(true);
        }
      } else {
        // Se não houver dados, inicializa com informações do usuário
        const perfilData = {
          id: user.id,
          nome: user.user_metadata?.nome || user.email,
          email: user.email,
          telefone: "",
          endereco: "",
          biografia: "",
          habilidades: [],
          disponivel: true,
          fotoPerfil: null,
          tipo_usuario: 'contratante' // Assume contratante por padrão
        };
        setPerfil(perfilData);
        reset(perfilData);
      }
      setIsLoading(false);
    };

    carregarPerfil();
  }, [user, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const { nome, telefone, endereco, biografia, habilidades, disponivel, fotoPerfil } = data;

      // Determina o novo tipo de usuário
      let novoTipoUsuario = perfil?.tipo_usuario || 'contratante';
      if (mostrarPerfilProfissional && (biografia || habilidades.length > 0)) {
        novoTipoUsuario = perfil?.tipo_usuario === 'contratante' ? 'ambos' : 'trabalhador';
      }

      // Atualizar tabela perfis
      const { error: perfilError } = await supabase
        .from("perfis")
        .upsert({
          id: user.id,
          nome,
          telefone,
          endereco,
          foto_perfil_url: fotoPerfil,
          tipo_usuario: novoTipoUsuario,
        }, { onConflict: "id" });

      if (perfilError) throw perfilError;

      // Atualizar tabela perfis_profissionais apenas se mostrar perfil profissional
      if (mostrarPerfilProfissional) {
        const { error: profissionalError } = await supabase
          .from("perfis_profissionais")
          .upsert({
            perfil_id: user.id,
            biografia,
            habilidades,
            disponivel,
          }, { onConflict: "perfil_id" });

        if (profissionalError) throw profissionalError;
      }

      // Atualiza o estado local
      setPerfil(prev => ({ ...prev, tipo_usuario: novoTipoUsuario }));

      alert("✅ Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(`❌ Erro ao salvar: ${error.message}. Verifique o console para mais detalhes.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTornarTrabalhador = () => {
    setMostrarPerfilProfissional(true);
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
      {/* Botão Voltar */}
      <div className="header-actions">
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="btn-voltar"
        >
          ← Voltar para o Início
        </button>
      </div>

      <div className="perfil-header">
        <h1>Configurações do Perfil</h1>
        <p>Gerencie suas informações pessoais e profissionais</p>
        <div className="perfil-stats">
          <div className="stat-item">
            <span className="stat-number">⭐ {perfil?.avaliacaoMedia || 0}</span>
            <span className="stat-label">Avaliação</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{perfil?.totalServicos || 0}</span>
            <span className="stat-label">Serviços</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
        
        {/* Seção de Informações Pessoais */}
        <div className="form-section">
          <h2>Informações Pessoais</h2>
          
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              {...register('nome', { 
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
              className={`form-input ${errors.nome ? 'error' : ''}`}
              placeholder="Seu nome completo"
            />
            {errors.nome && (
              <span className="error-message">{errors.nome.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              {...register('telefone', { 
                required: 'Telefone é obrigatório',
                pattern: {
                  value: /^[\d\s\(\)\-\+]+$/,
                  message: 'Formato de telefone inválido'
                }
              })}
              className={`form-input ${errors.telefone ? 'error' : ''}`}
              placeholder="(11) 99999-9999"
            />
            {errors.telefone && (
              <span className="error-message">{errors.telefone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="endereco">Endereço</label>
            <input
              type="text"
              id="endereco"
              {...register('endereco', { 
                required: 'Endereço é obrigatório',
                minLength: {
                  value: 10,
                  message: 'Endereço deve ter pelo menos 10 caracteres'
                }
              })}
              className={`form-input ${errors.endereco ? 'error' : ''}`}
              placeholder="Rua, número, bairro, cidade"
            />
            {errors.endereco && (
              <span className="error-message">{errors.endereco.message}</span>
            )}
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

        {/* Seção do Perfil Profissional */}
        {mostrarPerfilProfissional ? (
          <div className="form-section">
            <h2>Perfil Profissional</h2>
            
            {/* Seção da Biografia */}
            <div className="form-group">
              <label htmlFor="biografia">Sobre Mim</label>
              <textarea
                id="biografia"
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
            <div className="form-group">
              <label>Minhas Habilidades</label>
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
            <div className="form-group">
              <label>Disponibilidade</label>
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
          </div>
        ) : (
          <div className="form-section tornar-trabalhador-section">
            <h2>Quer oferecer seus serviços?</h2>
            <div className="tornar-trabalhador-container">
              <div className="tornar-trabalhador-content">
                <div className="icon">💼</div>
                <h3>Torne-se um Trabalhador</h3>
                <p>
                  Expanda suas oportunidades! Como trabalhador, você pode:
                </p>
                <ul>
                  <li>✅ Receber solicitações de serviços</li>
                  <li>✅ Mostrar suas habilidades e experiência</li>
                  <li>✅ Definir sua disponibilidade</li>
                  <li>✅ Construir sua reputação</li>
                </ul>
                <button 
                  type="button" 
                  onClick={handleTornarTrabalhador}
                  className="btn-tornar-trabalhador"
                >
                  Clique aqui para se tornar um trabalhador
                </button>
              </div>
            </div>
          </div>
        )}

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
            disabled={isSaving || (mostrarPerfilProfissional && habilidadesSelecionadas.length === 0)}
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
