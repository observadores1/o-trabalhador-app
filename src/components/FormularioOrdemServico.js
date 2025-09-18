// src/components/FormularioOrdemServico.js - VERSÃO UNIVERSAL (CRIAÇÃO E EDIÇÃO)

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabaseClient';
import SeletorDeLocalizacao from './SeletorDeLocalizacao';

// 1. O componente agora aceita novas props para o modo de edição
const FormularioOrdemServico = ({ trabalhadorId, onFormSubmit, osIdParaEditar = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Estado para o carregamento dos dados de edição
  const [listaDeHabilidades, setListaDeHabilidades] = useState([]);

  // Verifica se estamos em modo de edição
  const isEditMode = !!osIdParaEditar;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    // Os valores padrão continuam os mesmos, serão sobrescritos no modo de edição
    defaultValues: {
      habilidade: '',
      titulo_servico: '',
      descricao_servico: '',
      data_inicio_prevista: '',
      data_conclusao: '',
      valor_proposto: '',
      observacoes: '',
      endereco: { rua: '', numero: '', bairro: '', cidade: '', estado: '' },
      detalhes_adicionais: {
        necessario_transporte: false,
        necessario_ferramentas: false,
        necessario_refeicao: false,
        necessario_ajudante: false,
      }
    }
  });

  // 2. useEffect para buscar dados da OS no modo de edição
  useEffect(() => {
    const buscarHabilidades = async () => {
      const { data } = await supabase.from('habilidades').select('nome').order('nome');
      if (data) setListaDeHabilidades(data);
    };

    const carregarDadosOS = async () => {
      if (isEditMode) {
        const { data: osData, error } = await supabase
          .from('ordens_de_servico')
          .select('*')
          .eq('id', osIdParaEditar)
          .single();

        if (error) {
          console.error("Erro ao buscar dados da OS para edição:", error);
          alert("Não foi possível carregar os dados para edição.");
          setIsLoadingData(false);
          return;
        }

        if (osData) {
          // 3. Preenche o formulário com os dados existentes usando reset()
          // O valor_acordado é mapeado para valor_proposto para reutilizar o campo
          const dadosFormatados = {
            ...osData,
            valor_proposto: osData.valor_acordado,
            // Formata as datas para o formato esperado pelo input datetime-local
            data_inicio_prevista: osData.data_inicio_prevista ? new Date(osData.data_inicio_prevista).toISOString().slice(0, 16) : '',
            data_conclusao: osData.data_conclusao ? new Date(osData.data_conclusao).toISOString().slice(0, 16) : '',
          };
          reset(dadosFormatados);
        }
      }
      setIsLoadingData(false);
    };

    buscarHabilidades();
    carregarDadosOS();
  }, [isEditMode, osIdParaEditar, reset]);

  // 4. A função onSubmit agora é genérica
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Chama a função passada pelo componente pai (seja onOsCriada ou onOsEditada)
      await onFormSubmit(formData);
    } catch (error) {
      console.error("Erro ao submeter o formulário:", error);
      alert("Houve um erro ao enviar sua ordem de serviço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exibe uma mensagem de carregamento enquanto busca os dados da OS
  if (isLoadingData && isEditMode) {
    return <div>Carregando dados da Ordem de Serviço...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-os">
      {/* O restante do formulário JSX permanece exatamente o mesmo */}
      <div className="form-section">
        <h2>Detalhes do Serviço</h2>
        <div className="form-group">
          <label>Serviço Desejado</label>
          <select {...register('habilidade', { required: 'Campo obrigatório' })}>
            <option value="">Selecione a habilidade principal</option>
            {listaDeHabilidades.map(h => <option key={h.nome} value={h.nome}>{h.nome}</option>)}
          </select>
          {errors.habilidade && <span className="error-message">{errors.habilidade.message}</span>}
        </div>
        <div className="form-group">
          <label>Título do Serviço</label>
          <input {...register('titulo_servico', { required: 'Campo obrigatório' })} placeholder="Ex: Instalação de chuveiro elétrico" />
          {errors.titulo_servico && <span className="error-message">{errors.titulo_servico.message}</span>}
        </div>
        <div className="form-group">
          <label>Descrição Detalhada</label>
          <textarea {...register('descricao_servico', { required: 'Campo obrigatório' })} rows="4" placeholder="Descreva o que precisa ser feito..."></textarea>
          {errors.descricao_servico && <span className="error-message">{errors.descricao_servico.message}</span>}
        </div>
      </div>

      <div className="form-section">
        <h2>Prazos e Valores</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Início Previsto</label>
            <input type="datetime-local" {...register('data_inicio_prevista', { required: 'Campo obrigatório' })} />
            {errors.data_inicio_prevista && <span className="error-message">{errors.data_inicio_prevista.message}</span>}
          </div>
          <div className="form-group">
            <label>Término Previsto</label>
            <input type="datetime-local" {...register('data_conclusao', { required: 'Campo obrigatório' })} />
            {errors.data_conclusao && <span className="error-message">{errors.data_conclusao.message}</span>}
          </div>
        </div>
        <div className="form-group">
          <label>Valor Proposto (Opcional)</label>
          <input type="number" {...register('valor_proposto')} placeholder="R$" />
        </div>
      </div>

      <div className="form-section">
        <h2>Endereço do Serviço</h2>
        <SeletorDeLocalizacao
          estadoInicial={watch("endereco.estado")}
          cidadeInicial={watch("endereco.cidade")}
          onEstadoChange={(val) => setValue('endereco.estado', val, { shouldDirty: true })}
          onCidadeChange={(val) => setValue('endereco.cidade', val, { shouldDirty: true })}
        />
        <div className="form-group">
          <label>Rua</label>
          <input {...register('endereco.rua', { required: 'Campo obrigatório' })} />
          {errors.endereco?.rua && <span className="error-message">{errors.endereco.rua.message}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Número</label>
            <input {...register('endereco.numero', { required: 'Campo obrigatório' })} />
            {errors.endereco?.numero && <span className="error-message">{errors.endereco.numero.message}</span>}
          </div>
          <div className="form-group">
            <label>Bairro</label>
            <input {...register('endereco.bairro', { required: 'Campo obrigatório' })} />
            {errors.endereco?.bairro && <span className="error-message">{errors.endereco.bairro.message}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Necessidades Adicionais</h2>
        <div className="checkbox-group">
          <label><input type="checkbox" {...register('detalhes_adicionais.necessario_transporte')} /> Necessário transporte até o local</label>
          <label><input type="checkbox" {...register('detalhes_adicionais.necessario_ferramentas')} /> Necessário que o trabalhador traga ferramentas</label>
          <label><input type="checkbox" {...register('detalhes_adicionais.necessario_refeicao')} /> Refeição inclusa no local</label>
          <label><input type="checkbox" {...register('detalhes_adicionais.necessario_ajudante')} /> Será necessário um ajudante</label>
        </div>
      </div>

      <div className="form-section">
        <h2>Observações (Opcional)</h2>
        <textarea {...register('observacoes')} rows="3" placeholder="Alguma informação extra?"></textarea>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {/* 5. O texto do botão agora é dinâmico */}
          {isSubmitting ? 'Enviando...' : (isEditMode ? 'Salvar Alterações' : (trabalhadorId ? 'Propor Serviço' : 'Criar Oferta Pública'))}
        </button>
      </div>
    </form>
  );
};

export default FormularioOrdemServico;
