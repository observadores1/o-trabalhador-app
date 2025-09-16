import React, { useState, useEffect } from 'react';
import axios from 'axios';

const estadosBrasileiros = [
    { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' }, { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' }, { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' }, { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' }, { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
];

const SeletorDeLocalizacao = ({ valorEstado, valorCidade, onEstadoChange, onCidadeChange }) => {
  const [cidades, setCidades] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (valorEstado) {
      setCarregando(true);
      axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${valorEstado}/municipios` )
        .then(response => {
          const cidadesOrdenadas = response.data.sort((a, b) => a.nome.localeCompare(b.nome));
          setCidades(cidadesOrdenadas);
          setCarregando(false);
        })
        .catch(error => {
          console.error("Erro ao buscar cidades:", error);
          setCarregando(false);
        });
    } else {
      setCidades([]);
    }
  }, [valorEstado]);

  return (
    <>
      <div className="form-group">
        <label>Estado (UF)</label>
        <select
          value={valorEstado || ''}
          onChange={e => onEstadoChange(e.target.value)}
          className="form-input"
        >
          <option value="">-- Selecione um estado --</option>
          {estadosBrasileiros.map(estado => (
            <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Cidade</label>
        <select
          value={valorCidade || ''}
          onChange={e => onCidadeChange(e.target.value)}
          disabled={!valorEstado || carregando}
          className="form-input"
        >
          {carregando ? (
            <option>Carregando...</option>
          ) : cidades.length > 0 ? (
            <>
              <option value="">-- Selecione uma cidade --</option>
              {cidades.map(cidade => (
                <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
              ))}
            </>
          ) : (
            <option>-- Selecione um estado primeiro --</option>
          )}
        </select>
      </div>
    </>
  );
};

export default SeletorDeLocalizacao;
