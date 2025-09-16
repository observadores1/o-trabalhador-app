import React, { useState } from 'react';
import { buscarTrabalhadoresSupabase } from '../services/buscaService';
import SeletorDeLocalizacao from './SeletorDeLocalizacao'; // Importando o componente
import '../botoes.css';

const BuscaContratante = ({ onBuscar }) => {
  // Estados para controlar os valores dos campos do formulário
  const [servico, setServico] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [buscando, setBuscando] = useState(false);

  // Lista de habilidades para o seletor de serviço
  const habilidadesDisponiveis = [
    'Pintor', 'Eletricista', 'Encanador', 'Jardineiro', 'Pedreiro',
    'Marceneiro', 'Soldador', 'Mecânico', 'Limpeza', 'Cozinheiro',
    'Babá', 'Cuidador de Idosos'
  ];

  // Função chamada quando o formulário é enviado
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!servico) {
      alert('Por favor, selecione um serviço.');
      return;
    }
    setBuscando(true);
    try {
      // Chama a busca no backend passando todos os filtros
      const resultados = await buscarTrabalhadoresSupabase(servico, cidade, estado);
      // Notifica o componente pai (Dashboard) sobre os resultados
      onBuscar({ resultados, servico, cidade, estado });
    } catch (error) {
      alert('Ocorreu um erro ao realizar a busca.');
    } finally {
      setBuscando(false);
    }
  };

  // ==================================================
  // AS "ORELHAS" DO PAI: Funções para receber a mudança do SeletorDeLocalizacao
  // ==================================================
  const handleEstadoChange = (novoEstado) => {
    setEstado(novoEstado);
    setCidade(''); // Limpa a cidade quando o estado muda, forçando nova seleção
  };

  const handleCidadeChange = (novaCidade) => {
    setCidade(novaCidade);
  };
  // ==================================================

  return (
    <form onSubmit={handleSubmit} className="busca-contratante-form">
      <div className="form-group">
        <label htmlFor="servico">Qual serviço você precisa?</label>
        <select
          id="servico"
          value={servico}
          onChange={(e) => setServico(e.target.value)}
          className="form-input"
          required
        >
          <option value="">-- Selecione um serviço --</option>
          {habilidadesDisponiveis.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>

      {/* ================================================== */}
      {/* A "BOCA" DO PAI: Passando os valores e as funções para o seletor */}
      {/* ================================================== */}
      <SeletorDeLocalizacao
        valorEstado={estado}
        valorCidade={cidade}
        onEstadoChange={handleEstadoChange}
        onCidadeChange={handleCidadeChange}
      />

      <button type="submit" className="btn btn-primary" disabled={buscando}>
        {buscando ? 'Buscando...' : 'Buscar Trabalhadores'}
      </button>
    </form>
  );
};

export default BuscaContratante;
