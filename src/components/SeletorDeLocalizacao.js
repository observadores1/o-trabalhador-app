import React, { useState, useEffect } from 'react';

const SeletorDeLocalizacao = ({ 
  estado, 
  cidade, 
  onEstadoChange, 
  onCidadeChange,
  className = '',
  disabled = false 
}) => {
  const [cidades, setCidades] = useState([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);

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

  // useEffect para buscar cidades quando o estado muda
  useEffect(() => {
    if (estado) {
      const buscarCidades = async () => {
        setIsLoadingCidades(true);
        try {
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
          const cidadesData = await response.json();
          setCidades(cidadesData);
          
          // Limpa a cidade selecionada quando o estado muda
          if (onCidadeChange) {
            onCidadeChange('');
          }
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
          setCidades([]);
        } finally {
          setIsLoadingCidades(false);
        }
      };
      buscarCidades();
    } else {
      setCidades([]);
      if (onCidadeChange) {
        onCidadeChange('');
      }
    }
  }, [estado, onCidadeChange]);

  const handleEstadoChange = (e) => {
    const novoEstado = e.target.value;
    if (onEstadoChange) {
      onEstadoChange(novoEstado);
    }
  };

  const handleCidadeChange = (e) => {
    const novaCidade = e.target.value;
    if (onCidadeChange) {
      onCidadeChange(novaCidade);
    }
  };

  return (
    <>
      <div className={`form-group ${className}`}>
        <label htmlFor="estado">Estado (UF)</label>
        <select
          id="estado"
          value={estado || ''}
          onChange={handleEstadoChange}
          className="form-input"
          disabled={disabled}
        >
          <option value="">-- Selecione um estado --</option>
          {estadosBrasileiros.map(uf => (
            <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
          ))}
        </select>
      </div>

      <div className={`form-group ${className}`}>
        <label htmlFor="cidade">Cidade</label>
        <select
          id="cidade"
          value={cidade || ''}
          onChange={handleCidadeChange}
          className="form-input"
          disabled={disabled || !estado || isLoadingCidades}
        >
          <option value="">
            {!estado ? '-- Selecione um estado primeiro --' : 
             isLoadingCidades ? '-- Carregando cidades... --' : 
             cidades.length === 0 ? '-- Nenhuma cidade encontrada --' :
             '-- Selecione uma cidade --'}
          </option>
          {cidades.map(cidadeObj => (
            <option key={cidadeObj.id} value={cidadeObj.nome}>{cidadeObj.nome}</option>
          ))}
        </select>
      </div>
    </>
  );
};

export default SeletorDeLocalizacao;

