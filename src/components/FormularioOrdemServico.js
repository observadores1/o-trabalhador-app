// src/components/FormularioOrdemServico.js
    import React, { useState, useEffect } from 'react';
    import { useForm, Controller } from 'react-hook-form';
    import { supabase } from '../services/supabaseClient';
    import FormularioEndereco from './FormularioEndereco';

    const FormularioOrdemServico = ({ onSubmit, isSubmitting, defaultValues = {} }) => {
      const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
          habilidade_requerida: defaultValues.habilidade_requerida || '',
          titulo: defaultValues.titulo || '',
          descricao: defaultValues.descricao || '',
          data_inicio: defaultValues.data_inicio || '',
          data_termino_prevista: defaultValues.data_termino_prevista || '',
          necessita_transporte: defaultValues.necessita_transporte || false,
          necessita_ferramentas: defaultValues.necessita_ferramentas || false,
          necessita_refeicao: defaultValues.necessita_refeicao || false,
          necessita_ajudante: defaultValues.necessita_ajudante || false,
          endereco: defaultValues.endereco || { rua: '', numero: '', bairro: '', cidade: '', estado: '' },
          observacoes: defaultValues.observacoes || '',
          valor_proposto: defaultValues.valor_proposto || '',
        }
      });

      const [listaDeHabilidades, setListaDeHabilidades] = useState([]);

      useEffect(() => {
        const buscarHabilidades = async () => {
          const { data } = await supabase.from('habilidades').select('nome').order('nome');
          if (data) setListaDeHabilidades(data);
        };
        buscarHabilidades();
      }, []);

      return (
        <form onSubmit={handleSubmit(onSubmit)} className="perfil-form">
          {/* Seção Detalhes do Serviço */}
          <div className="form-section">
            <h2>Detalhes do Serviço</h2>
            <div className="form-group">
              <label>Habilidade Requerida</label>
              <select {...register('habilidade_requerida', { required: 'Selecione uma habilidade' })}>
                <option value="">-- Selecione --</option>
                {listaDeHabilidades.map(h => <option key={h.nome} value={h.nome}>{h.nome}</option>)}
              </select>
              {errors.habilidade_requerida && <span className="error-message">{errors.habilidade_requerida.message}</span>}
            </div>
            <div className="form-group">
              <label>Título do Serviço</label>
              <input {...register('titulo', { required: 'O título é obrigatório' })} placeholder="Ex: Instalação de 3 ventiladores de teto" />
              {errors.titulo && <span className="error-message">{errors.titulo.message}</span>}
            </div>
            <div className="form-group">
              <label>Descrição Detalhada do Serviço</label>
              <textarea {...register('descricao', { required: 'A descrição é obrigatória' })} rows="5" placeholder="Descreva o que precisa ser feito..."></textarea>
              {errors.descricao && <span className="error-message">{errors.descricao.message}</span>}
            </div>
          </div>

          {/* Seção Prazos */}
          <div className="form-section">
            <h2>Prazos</h2>
            <div className="form-group">
              <label>Data e Horário de Início</label>
              <input type="datetime-local" {...register('data_inicio', { required: 'A data de início é obrigatória' })} />
              {errors.data_inicio && <span className="error-message">{errors.data_inicio.message}</span>}
            </div>
            <div className="form-group">
              <label>Data Prevista de Término</label>
              <input type="datetime-local" {...register('data_termino_prevista', { required: 'A data de término é obrigatória' })} />
              {errors.data_termino_prevista && <span className="error-message">{errors.data_termino_prevista.message}</span>}
            </div>
          </div>

          {/* Seção Necessidades Adicionais */}
          <div className="form-section">
            <h2>Necessidades Adicionais</h2>
            <div className="habilidades-grid">
              <label className="habilidade-item"><input type="checkbox" {...register('necessita_transporte')} /> Transporte até o local</label>
              <label className="habilidade-item"><input type="checkbox" {...register('necessita_ferramentas')} /> Ferramentas próprias</label>
              <label className="habilidade-item"><input type="checkbox" {...register('necessita_refeicao')} /> Refeição no local</label>
              <label className="habilidade-item"><input type="checkbox" {...register('necessita_ajudante')} /> Necessário ajudante</label>
            </div>
          </div>

          {/* Seção Endereço do Serviço */}
          <div className="form-section">
            <h2>Endereço de Realização do Serviço</h2>
            <FormularioEndereco register={register} watch={watch} setValue={setValue} />
          </div>

          {/* Seção Opcionais */}
          <div className="form-section">
            <h2>Detalhes Opcionais</h2>
            <div className="form-group">
              <label>Observações</label>
              <textarea {...register('observacoes')} rows="3" placeholder="Alguma informação extra? (Ex: Cachorro no quintal, interfone quebrado)"></textarea>
            </div>
            <div className="form-group">
              <label>Valor Proposto (R$)</label>
              <Controller
                name="valor_proposto"
                control={control}
                render={({ field }) => <input type="number" step="0.01" {...field} placeholder="0,00" />}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Criar Ordem de Serviço'}
            </button>
          </div>
        </form>
      );
    };

    export default FormularioOrdemServico;