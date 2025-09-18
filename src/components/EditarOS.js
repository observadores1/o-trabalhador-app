// src/components/EditarOS.js - VERSÃO CORRIGIDA

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import FormularioOrdemServico from './FormularioOrdemServico'; // Caminho correto
import './EditarOS.css'; // <<-- CAMINHO CORRIGIDO

const EditarOS = () => {
  const { osId } = useParams();
  const navigate = useNavigate();

  const handleUpdateOS = async (formData) => {
    const osParaAtualizar = {
      habilidade: formData.habilidade,
      titulo_servico: formData.titulo_servico,
      descricao_servico: formData.descricao_servico,
      data_inicio_prevista: formData.data_inicio_prevista,
      data_conclusao: formData.data_conclusao,
      valor_acordado: formData.valor_proposto || null,
      observacoes: formData.observacoes,
      endereco: formData.endereco,
      detalhes_adicionais: formData.detalhes_adicionais,
    };

    try {
      const { error } = await supabase
        .from('ordens_de_servico')
        .update(osParaAtualizar)
        .eq('id', osId);

      if (error) throw error;

      alert('✅ Ordem de Serviço atualizada com sucesso!');
      navigate(`/os/${osId}`);

    } catch (error) {
      console.error('Erro ao atualizar Ordem de Serviço:', error);
      alert(`❌ Erro ao atualizar Ordem de Serviço: ${error.message}`);
    }
  };

  return (
    <div className="editar-os-container">
      <div className="editar-os-card">
        <h1>Editar Ordem de Serviço</h1>
        <p>Ajuste os detalhes da sua ordem de serviço abaixo.</p>
        <FormularioOrdemServico 
          osIdParaEditar={osId}
          onFormSubmit={handleUpdateOS} // Renomeei para ser genérico
        />
      </div>
    </div>
  );
};

export default EditarOS;
