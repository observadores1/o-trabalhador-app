    // src/PaginaNovaOS.js
    import React, { useState } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { useAuth } from './contexts/AuthContext';
    import { supabase } from './services/supabaseClient';
    import FormularioOrdemServico from './components/FormularioOrdemServico';
    import './PerfilProfissional.css'; // Reutilizando o estilo do formulário de perfil

    const PaginaNovaOS = () => {
      const { user } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();
      const [isSubmitting, setIsSubmitting] = useState(false);

      // Inteligência para pegar o ID do trabalhador da URL, se existir
      const params = new URLSearchParams(location.search);
      const trabalhadorId = params.get('trabalhador_id');

      const handleCreateOS = async (formData) => {
        if (!user) {
          alert("Você precisa estar logado para criar uma ordem de serviço.");
          return;
        }

        // Se não houver um trabalhadorId, é uma oferta pública.
        // Usamos um UUID padrão ou um valor nulo para representar isso.
        const targetTrabalhadorId = trabalhadorId || '00000000-0000-0000-0000-000000000000';
        const statusInicial = trabalhadorId ? 'pendente' : 'oferta_publica';

        setIsSubmitting(true);
        try {
          const { error } = await supabase.from('ordens_de_servico').insert({
            contratante_id: user.id,
            trabalhador_id: targetTrabalhadorId,
            descricao_servico: formData.descricao,
            status: statusInicial,
            valor_acordado: formData.valor_proposto || null,
            data_inicio_prevista: formData.data_inicio,
            data_conclusao: formData.data_termino_prevista, // Ajuste conforme nome da coluna
            // Aqui você pode adicionar os outros campos da tabela
            // ex: detalhes_adicionais: { necessita_transporte: formData.necessita_transporte, ... }
          });

          if (error) throw error;

          alert('✅ Ordem de Serviço criada com sucesso!');
          navigate('/dashboard'); // Ou para uma página de "Minhas Ordens de Serviço"

        } catch (error) {
          console.error("Erro ao criar Ordem de Serviço:", error);
          alert("❌ Falha ao criar a Ordem de Serviço. Tente novamente.");
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="perfil-container">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">← Voltar</button>
          <h1>{trabalhadorId ? 'Propor Serviço' : 'Criar Oferta de Serviço'}</h1>
          <p>{trabalhadorId ? 'Preencha os detalhes abaixo para enviar uma proposta para o trabalhador selecionado.' : 'Descreva o serviço que você precisa. Sua oferta ficará visível para os trabalhadores da plataforma.'}</p>
          
          <FormularioOrdemServico 
            onSubmit={handleCreateOS}
            isSubmitting={isSubmitting}
          />
        </div>
      );
    };

    export default PaginaNovaOS;