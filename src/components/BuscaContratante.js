import React, { useState, useEffect } from 'react';
import { buscarTrabalhadoresSupabase } from '../services/buscaService';
import { supabase } from '../services/supabaseClient';
import SeletorDeLocalizacao from './SeletorDeLocalizacao';
import '../botoes.css';

const BuscaContratante = ({ onBuscar }) => {
  // Estados para controlar os valores de todos os campos do formulário
  const [servico, setServico] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState(''); // <-- Estado para o bairro adicionado
  const [buscando, setBuscando] = useState(false);
  const [listaDeHabilidades, setListaDeHabilidades] = useState([]);

  // useEffect para buscar habilidades do Supabase
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

  // Função chamada quando o formulário é enviado
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!servico) {
      alert('Por favor, selecione um serviço.');
      return;
    }
    setBuscando(true);
    try {
      // Chama a busca no backend passando TODOS os filtros, incluindo o bairro
      const resultados = await buscarTrabalhadoresSupabase(servico, cidade, estado, bairro);
      // Notifica o componente pai (Dashboard) sobre os resultados e todos os termos de busca
      onBuscar({ resultados, servico, cidade, estado, bairro });
    } catch (error) {
      alert('Ocorreu um erro ao realizar a busca.');
    } finally {
      setBuscando(false);
    }
  };

  // Funções para receber as mudanças do SeletorDeLocalizacao
  const handleEstadoChange = (novoEstado) => {
    setEstado(novoEstado);
    setCidade(''); // Limpa a cidade quando o estado muda
  };

  const handleCidadeChange = (novaCidade) => {
    setCidade(novaCidade);
  };

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
          {listaDeHabilidades.map(h => (
            <option key={h.nome} value={h.nome}>{h.nome}</option>
          ))}
        </select>
      </div>

      {/* Componente reutilizável para Estado e Cidade */}
      <SeletorDeLocalizacao
        valorEstado={estado}
        valorCidade={cidade}
        onEstadoChange={handleEstadoChange}
        onCidadeChange={handleCidadeChange}
      />

      {/* Campo de Bairro (Opcional) adicionado de volta */}
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

      <button type="submit" className="btn btn-primary" disabled={buscando}>
        {buscando ? 'Buscando...' : 'Buscar Trabalhadores'}
      </button>
    </form>
  );
};

export default BuscaContratante;
