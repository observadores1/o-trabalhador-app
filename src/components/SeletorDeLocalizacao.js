import React, { useState, useEffect } from 'react';

// Lista de estados movida para cá para ser reutilizável
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

const SeletorDeLocalizacao = ({ estadoSelecionado, cidadeSelecionada, onEstadoChange, onCidadeChange }) => {
  const [cidades, setCidades] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);

  useEffect(() => {
    // Se um estado foi selecionado, busca as cidades correspondentes
    if (estadoSelecionado) {
      setCarregandoCidades(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios` )
        .then(response => response.json())
        .then(data => {
          setCidades(data);
          setCarregandoCidades(false);
        })
        .catch(error => {
          console.error("Erro ao buscar cidades:", error);
          setCarregandoCidades(false);
          setCidades([]);
        });
    } else {
      // Se nenhum estado está selecionado, limpa a lista de cidades
      setCidades([]);
    }
  }, [estadoSelecionado]); // Este useEffect agora só depende do estadoSelecionado

  return (
    <>
      <div className="form-group">
        <label>Estado (UF)</label>
        <select
          value={estadoSelecionado || ''}
          onChange={(e) => onEstadoChange(e.target.value)}
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
          value={cidadeSelecionada || ''}
          onChange={(e) => onCidadeChange(e.target.value)}
          disabled={!estadoSelecionado || carregandoCidades}
          className="form-input"
        >
          {carregandoCidades ? (
            <option>Carregando cidades...</option>
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
