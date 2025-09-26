/**
 * @file SeletorDeLocalizacao.js
 * @description Componente para selecionar Estado e Cidade usando a API do IBGE.
 * @author Jeferson Gnoatto
 * @date 2025-09-25
 * Louvado seja Cristo, Louvado seja Deus
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeletorDeLocalizacao = ({ onEstadoChange, onCidadeChange, estadoInicial, cidadeInicial }) => {
    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [estadoSelecionado, setEstadoSelecionado] = useState(estadoInicial || '');
    const [cidadeSelecionada, setCidadeSelecionada] = useState(cidadeInicial || '');
    const [carregandoCidades, setCarregandoCidades] = useState(false);

    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'  )
            .then(response => {
                setEstados(response.data);
            });
    }, []);

    useEffect(() => {
        if (estadoInicial) {
            setEstadoSelecionado(estadoInicial);
        }
    }, [estadoInicial]);

    useEffect(() => {
        if (estadoSelecionado) {
            setCarregandoCidades(true);
            axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`  )
                .then(response => {
                    setCidades(response.data);
                    if (cidadeInicial && response.data.some(c => c.nome === cidadeInicial)) {
                        setCidadeSelecionada(cidadeInicial);
                    }
                    setCarregandoCidades(false);
                });
        } else {
            setCidades([]);
        }
    }, [estadoSelecionado, cidadeInicial]);

    const handleEstadoChange = (e) => {
        const novoEstado = e.target.value;
        setEstadoSelecionado(novoEstado);
        setCidadeSelecionada('');
        onEstadoChange(novoEstado);
        onCidadeChange('');
    };

    const handleCidadeChange = (e) => {
        const novaCidade = e.target.value;
        setCidadeSelecionada(novaCidade);
        onCidadeChange(novaCidade);
    };

    // A estrutura do JSX foi alterada para se adequar ao CSS de Oportunidades.
    return (
        // Usamos um Fragment <> pois o grid já está no componente pai.
        <>
            <div className="filtro-item">
                <label htmlFor="estado">Estado</label>
                <select 
                    id="estado" 
                    value={estadoSelecionado} 
                    onChange={handleEstadoChange}
                    // A MÁGICA ACONTECE AQUI: Aplicamos a classe padrão
                    className="form-input" 
                >
                    <option value="">Selecione um estado</option>
                    {estados.map(estado => (
                        <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                    ))}
                </select>
            </div>
            <div className="filtro-item">
                <label htmlFor="cidade">Cidade</label>
                <select 
                    id="cidade" 
                    value={cidadeSelecionada} 
                    onChange={handleCidadeChange} 
                    disabled={!estadoSelecionado || carregandoCidades}
                    // E AQUI TAMBÉM: A mesma classe para garantir consistência
                    className="form-input"
                >
                    <option value="">
                        {carregandoCidades ? 'Carregando...' : (estadoSelecionado ? 'Selecione uma cidade' : 'Selecione um estado primeiro')}
                    </option>
                    {cidades.map(cidade => (
                        <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default SeletorDeLocalizacao;
