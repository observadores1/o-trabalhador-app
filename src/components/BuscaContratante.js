import React, { useState, useEffect } from 'react';
import { buscarTrabalhadoresSupabase } from '../services/buscaService';
import { supabase } from '../services/supabaseClient';
import SeletorDeLocalizacao from './SeletorDeLocalizacao';
import '../botoes.css';

// ===================================================================
// 1. DEFINIÇÃO DOS SUB-COMPONENTES INTERNOS (Stateless)
// ===================================================================

const SecaoServico = ({ servico, setServico, listaDeHabilidades }) => (
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
      {listaDeHabilidades.map(h => (
        <option key={h.nome} value={h.nome}>{h.nome}</option>
      ))}
    </select>
  </div>
);

const SecaoLocalizacao = ({ estado, setEstado, cidade, setCidade, bairro, setBairro }) => {
  const handleEstadoChange = (novoEstado) => {
    setEstado(novoEstado);
    setCidade(''); // Limpa a cidade quando o estado muda
  };

  const handleCidadeChange = (novaCidade) => {
    setCidade(novaCidade);
  };

  return (
    <>
      <SeletorDeLocalizacao
        valorEstado={estado}
        valorCidade={cidade}
        onEstadoChange={handleEstadoChange}
        onCidadeChange={handleCidadeChange}
      />
      <div className="form-group">
        <label htmlFor="bairro">Bairro (Opcional)</label>
        <input
          type="text"
          id="bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          placeholder="Filtre por um bairro específico"
          className="form-input"
        />
      </div>
    </>
  );
};

// ===================================================================
// 2. COMPONENTE PRINCIPAL (Container) - Agora muito mais limpo
// ===================================================================

const BuscaContratante = ({ onBuscar }) => {
  const [servico, setServico] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [listaDeHabilidades, setListaDeHabilidades] = useState([]);

  useEffect(() => {
    const buscarHabilidades = async () => {
      const { data, error } = await supabase
        .from('habilidades')
        .select('nome')
        .order('nome', { ascending: true });

      if (data) {
        setListaDeHabilidades(data);
      }
    };
    buscarHabilidades();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!servico) {
      alert('Por favor, selecione um serviço.');
      return;
    }
    setBuscando(true);
    try {
      const resultados = await buscarTrabalhadoresSupabase(servico, cidade, estado, bairro);
      onBuscar({ resultados, servico, cidade, estado, bairro });
    } catch (error) {
      alert('Ocorreu um erro ao realizar a busca.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="busca-contratante-form">
      <SecaoServico
        servico={servico}
        setServico={setServico}
        listaDeHabilidades={listaDeHabilidades}
      />

      <SecaoLocalizacao
        estado={estado}
        setEstado={setEstado}
        cidade={cidade}
        setCidade={setCidade}
        bairro={bairro}
        setBairro={setBairro}
      />

      <button type="submit" className="btn btn-primary" disabled={buscando}>
        {buscando ? 'Buscando...' : 'Buscar Trabalhadores'}
      </button>
    </form>
  );
};

export default BuscaContratante;


