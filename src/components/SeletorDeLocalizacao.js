import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeletorDeLocalizacao = ({ valorEstado, valorCidade, onEstadoChange, onCidadeChange }) => {
    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [loadingCidades, setLoadingCidades] = useState(false);

    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(response => {
                setEstados(response.data);
            });
    }, []);

    useEffect(() => {
        if (valorEstado) {
            setLoadingCidades(true);
            axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${valorEstado}/municipios`)
                .then(response => {
                    setCidades(response.data);
                    setLoadingCidades(false);
                });
        } else {
            setCidades([]);
        }
    }, [valorEstado]);

    return (
        <>
            <div className="form-group">
                <label>Estado (UF)</label>
                <select className="form-control" value={valorEstado} onChange={onEstadoChange}>
                    <option value="">-- Selecione um estado --</option>
                    {estados.map(estado => (
                        <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Cidade</label>
                <select className="form-control" value={valorCidade} onChange={onCidadeChange} disabled={!valorEstado || loadingCidades}>
                    {loadingCidades ? (
                        <option>Carregando...</option>
                    ) : (
                        <>
                            <option value="">-- Selecione uma cidade --</option>
                            {cidades.map(cidade => (
                                <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                            ))}
                        </>
                    )}
                </select>
            </div>
        </>
    );
};

export default SeletorDeLocalizacao;
