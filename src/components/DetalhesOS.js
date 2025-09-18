// src/components/DetalhesOS.js - VERSÃO FINAL (AGORA DE VERDADE) COM TODOS OS DETALHES

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import './DetalhesOS.css';

const DetalhesOS = () => {
  const { osId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordemDeServico, setOrdemDeServico] = useState(null);
  const [nomesEnvolvidos, setNomesEnvolvidos] = useState({ contratante: '', trabalhador: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarDetalhesOS = async () => {
      if (!osId || !user) return;
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase.from('ordens_de_servico').select(`*`).eq('id', osId).single();
        if (fetchError) throw fetchError;

        if (data && (data.contratante_id === user.id || data.trabalhador_id === user.id)) {
          setOrdemDeServico(data);
          const idsParaBuscar = [data.contratante_id];
          if (data.trabalhador_id) idsParaBuscar.push(data.trabalhador_id);
          const { data: perfisData, error: perfisError } = await supabase.from('perfis').select('id, apelido').in('id', idsParaBuscar);
          if (perfisError) throw perfisError;
          const nomes = {};
          perfisData.forEach(perfil => {
            if (perfil.id === data.contratante_id) nomes.contratante = perfil.apelido;
            if (perfil.id === data.trabalhador_id) nomes.trabalhador = perfil.apelido;
          });
          setNomesEnvolvidos(nomes);
        } else {
          throw new Error("Você não tem permissão para ver esta Ordem de Serviço.");
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes da OS:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDetalhesOS();
  }, [osId, user]);

  if (isLoading) return <div className="detalhes-os-container"><p>Carregando detalhes...</p></div>;
  if (error) return <div className="detalhes-os-container"><p className="error-message">{error}</p><button onClick={() => navigate('/minhas-os')} className="btn btn-secondary">Voltar</button></div>;
  if (!ordemDeServico) return <div className="detalhes-os-container"><p>Ordem de Serviço não encontrada.</p></div>;

  const detalhes = ordemDeServico.detalhes_adicionais || {};

  return (
    <div className="detalhes-os-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">← Voltar</button>
      
      <header className="detalhes-os-header">
        {/* O TÍTULO DO SERVIÇO AGORA APARECE AQUI */}
        <h1>{ordemDeServico.titulo_servico || 'Detalhes da Ordem de Serviço'}</h1>
        <span className={`os-status-badge status-${ordemDeServico.status}`}>{ordemDeServico.status.replace('_', ' ')}</span>
      </header>

      <div className="detalhes-os-grid">
        <div className="detalhes-os-section">
          <h2>Serviço Solicitado</h2>
          {/* A HABILIDADE PRINCIPAL AGORA APARECE AQUI */}
          <p><strong>Habilidade Principal:</strong> {ordemDeServico.habilidade}</p>
          <p><strong>Descrição:</strong> {ordemDeServico.descricao_servico}</p>
          <p><strong>Valor Acordado:</strong> R$ {ordemDeServico.valor_acordado || 'A combinar'}</p>
          <p><strong>Início Previsto:</strong> {new Date(ordemDeServico.data_inicio_prevista).toLocaleString()}</p>
          <p><strong>Término Previsto:</strong> {new Date(ordemDeServico.data_conclusao).toLocaleString()}</p>
          
          {ordemDeServico.endereco && (
            <>
              <p><strong>Endereço do Serviço:</strong></p>
              <div className="endereco-detalhes">
                {`${ordemDeServico.endereco.rua} - ${ordemDeServico.endereco.numero}, `}   

                {`${ordemDeServico.endereco.bairro}, `}   

                {`${ordemDeServico.endereco.cidade} - ${ordemDeServico.endereco.estado}`}
              </div>
            </>
          )}
        </div>

        <div className="detalhes-os-section">
          <h2>Envolvidos</h2>
          <p><strong>Contratante:</strong> {nomesEnvolvidos.contratante}</p>
          <p><strong>Trabalhador:</strong> {nomesEnvolvidos.trabalhador || 'Aguardando aceite'}</p>
        </div>

        <div className="detalhes-os-section full-width">
          <h2>Detalhes Adicionais e Observações</h2>
          <ul>
            {detalhes.necessario_transporte && <li>Necessário transporte até o local</li>}
            {detalhes.necessario_ferramentas && <li>Necessário que o trabalhador traga ferramentas</li>}
            {detalhes.necessario_refeicao && <li>Refeição inclusa no local</li>}
            {detalhes.necessario_ajudante && <li>Será necessário um ajudante</li>}
            {!detalhes.necessario_transporte && !detalhes.necessario_ferramentas && !detalhes.necessario_refeicao && !detalhes.necessario_ajudante && (
              <li>Nenhum detalhe adicional informado.</li>
            )}
          </ul>
          {ordemDeServico.observacoes ? (
            <p><strong>Observações:</strong> {ordemDeServico.observacoes}</p>
          ) : (
            <p><strong>Observações:</strong> Nenhuma observação fornecida.</p>
          )}
        </div>
      </div>

      <div className="detalhes-os-actions">
        <h2>Ações</h2>
        <p>Em breve, os botões de ação (Cancelar, Concluir, Avaliar) aparecerão aqui com base no status da OS.</p>
      </div>
    </div>
  );
};

export default DetalhesOS;
