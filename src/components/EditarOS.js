/**
 * @file EditarOS.js
 * @description Página para editar uma Ordem de Serviço existente.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import FormularioOrdemServico from './FormularioOrdemServico';
import HeaderEstiloTop from './HeaderEstiloTop'; // Importa o Estilo Top
// import './EditarOS.css'; // Se você tiver estilos específicos

const EditarOS = () => {
  const { osId } = useParams();
  const navigate = useNavigate();

  const handleUpdateOS = async (formData) => {
    // Validação para garantir que a data de término não seja vazia
    const dataConclusaoFinal = formData.data_conclusao || null;

    const osParaAtualizar = {
      habilidade: formData.habilidade,
      titulo_servico: formData.titulo_servico,
      descricao_servico: formData.descricao_servico,
      data_inicio_prevista: formData.data_inicio_prevista,
      data_conclusao: dataConclusaoFinal, // Usa a data formatada ou null
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
    <div className="page-container"> {/* Container geral para o Estilo Top */}
      <HeaderEstiloTop showUserActions={false} />
      <main className="main-content">
        <div className="pagina-os-header">
          <h1>Editar Ordem de Serviço</h1>
          <p>Ajuste os detalhes da sua ordem de serviço abaixo.</p>
        </div>
        <div className="pagina-os-main">
          <FormularioOrdemServico 
            osIdParaEditar={osId} // Passa o ID para o formulário saber que está em modo de edição
            onFormSubmit={handleUpdateOS}
          />
        </div>
      </main>
    </div>
  );
};

export default EditarOS;
