import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarTrabalhadoresSupabase } from '../services/buscaService';
import './BuscaContratante.css';

const BuscaContratante = ({ onBuscar }) => {
  const [servico, setServico] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cidades, setCidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const estadosBrasileiros = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  const habilidadesDisponiveis = [
    'Pintor', 'Eletricista', 'Encanador', 'Jardineiro', 'Pedreiro', 
    'Marceneiro', 'Soldador', 'Mecânico', 'Limpeza', 'Cozinheiro', 
    'Babá', 'Cuidador de Idosos'
  ];

  // useEffect para buscar cidades quando o estado muda
  useEffect(() => {
    if (estado) {
      const buscarCidades = async () => {
        try {
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
          const cidadesData = await response.json();
          setCidades(cidadesData);
          setCidade(''); // Limpa a cidade selecionada quando o estado muda
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
          setCidades([]);
        }
      };
      buscarCidades();
    } else {
      setCidades([]);
      setCidade('');
    }
  }, [estado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!servico) { // Alterado para verificar se o serviço foi selecionado
      alert('Por favor, selecione o tipo de serviço que você precisa.');
      return;
    }

    setIsLoading(true);

    try {
      let resultados = await buscarTrabalhadoresSupabase(servico, localizacao.trim(), cidade.trim(), estado.trim());
      
      if (onBuscar) {
        onBuscar({ servico: servico, localizacao: localizacao.trim(), cidade: cidade.trim(), estado: estado.trim(), resultados });
      } else {
        navigate('/resultados', { 
          state: { 
            resultados, 
            termoBusca: { servico: servico, localizacao: localizacao.trim(), cidade: cidade.trim(), estado: estado.trim() } 
          } 
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao buscar trabalhadores. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="busca-container">
      <div className="busca-header">
        <img src="https://raw.githubusercontent.com/observadores1/o-trabalhador-app/main/Logo%20o%20Trabalhador.jpeg" alt="Logo O Trabalhador" className="logo" />
        <h1>O TRABALHADOR</h1>
        <p>Encontre o profissional ideal para seu serviço</p>
      </div>
      
      <form className="busca-form" onSubmit={handleSubmit}>
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

        <div className="form-group">
          <label htmlFor="localizacao">Onde é o serviço?</label>
          <input
            type="text"
            id="localizacao"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            placeholder="Ex: Centro, Copacabana, São Paulo..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cidade">Cidade</label>
          <select
            id="cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="form-input"
            disabled={!estado || cidades.length === 0}
          >
            <option value="">
              {!estado ? '-- Selecione um estado primeiro --' : 
               cidades.length === 0 ? '-- Carregando cidades... --' : 
               '-- Selecione uma cidade --'}
            </option>
            {cidades.map(cidadeObj => (
              <option key={cidadeObj.id} value={cidadeObj.nome}>{cidadeObj.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado (UF)</label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="form-input"
          >
            <option value="">-- Selecione um estado --</option>
            {estadosBrasileiros.map(uf => (
              <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="buscar-btn" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar Trabalhadores'}
        </button>
      </form>
    </div>
  );
};

export default BuscaContratante;


