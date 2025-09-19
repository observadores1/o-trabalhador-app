// src/components/EditarOS.js - VERSÃO CORRIGIDA

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import FormularioOrdemServico from './FormularioOrdemServico';
// import './EditarOS.css'; // Se você tiver estilos específicos

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
      navigate(`/os/${osId}`); // Volta para a página de detalhes

    } catch (error) {
      console.error('Erro ao atualizar Ordem de Serviço:', error);
      alert(`❌ Erro ao atualizar Ordem de Serviço: ${error.message}`);
    }
  };

  return (
    <div className="pagina-os-container">
      <header className="pagina-os-header">
        <h1>Editar Ordem de Serviço</h1>
        <p>Ajuste os detalhes da sua ordem de serviço abaixo.</p>
      </header>
      <main className="pagina-os-main">
        <FormularioOrdemServico 
          osId={osId} // Passa o ID para o formulário saber que está em modo de edição
          onFormSubmit={handleUpdateOS} // <<-- CORREÇÃO CRÍTICA: Passando a prop com o nome correto
        />
      </main>
    </div>
  );
};

export default EditarOS;
