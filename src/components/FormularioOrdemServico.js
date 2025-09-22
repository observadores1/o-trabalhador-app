/**
 * @file FormularioOrdemServico.js
 * @description Formulário universal para criar e editar Ordens de Serviço.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/supabaseClient';
import SeletorDeLocalizacao from './SeletorDeLocalizacao';

// O componente agora aceita a prop 'osIdParaEditar'
const FormularioOrdemServico = ({ trabalhadorId, onFormSubmit, osIdParaEditar = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [listaDeHabilidades, setListaDeHabilidades] = useState([]);

  const isEditMode = !!osIdParaEditar;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
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

  useEffect(() => {
    const buscarHabilidades = async () => {
      const { data } = await supabase.from('habilidades').select('nome').order('nome');
      if (data) setListaDeHabilidades(data);
    };

    const carregarDadosOS = async () => {
      if (isEditMode) {
        setIsLoadingData(true);
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
          // Formata as datas para o formato yyyy-MM-ddThh:mm
          const formatarDataParaInput = (data) => {
            if (!data) return '';
            const d = new Date(data);
            // Adiciona o offset do fuso horário para a data ficar correta no input
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
          };

          const dadosFormatados = {
            ...osData,
            valor_proposto: osData.valor_acordado,
            data_inicio_prevista: formatarDataParaInput(osData.data_inicio_prevista),
            data_conclusao: formatarDataParaInput(osData.data_conclusao),
          };
          reset(dadosFormatados);
        }
      }
      setIsLoadingData(false);
    };

    buscarHabilidades();
    carregarDadosOS();
  }, [isEditMode, osIdParaEditar, reset]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await onFormSubmit(formData);
    } catch (error) {
      // O alerta de erro já é tratado no componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData && isEditMode) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Carregando dados da Ordem de Serviço...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-os">
      {/* O JSX do formulário permanece o mesmo */}
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
            <input type="datetime-local" {...register('data_conclusao')} />
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
          {isSubmitting ? 'Enviando...' : (isEditMode ? 'Salvar Alterações' : (trabalhadorId ? 'Propor Serviço' : 'Criar Oferta Pública'))}
        </button>
      </div>
    </form>
  );
};

export default FormularioOrdemServico;
