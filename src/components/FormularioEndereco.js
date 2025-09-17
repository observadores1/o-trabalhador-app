    // src/components/FormularioEndereco.js
    import React from 'react';
    import SeletorDeLocalizacao from './SeletorDeLocalizacao';

    const FormularioEndereco = ({ register, watch, setValue }) => {
      const handleEstadoChange = (novoEstado) => {
        setValue('endereco.estado', novoEstado, { shouldDirty: true });
        setValue('endereco.cidade', '', { shouldDirty: true });
      };

      const handleCidadeChange = (novaCidade) => {
        setValue('endereco.cidade', novaCidade, { shouldDirty: true });
      };

      return (
        <>
          <div className="form-group">
            <label>Rua</label>
            <input {...register('endereco.rua')} placeholder="Sua rua" />
          </div>
          <div className="form-group">
            <label>Número</label>
            <input {...register('endereco.numero')} placeholder="Nº" />
          </div>
          <SeletorDeLocalizacao
            estadoInicial={watch("endereco.estado")}
            cidadeInicial={watch("endereco.cidade")}
            onEstadoChange={handleEstadoChange}
            onCidadeChange={handleCidadeChange}
          />
          <div className="form-group">
            <label>Bairro</label>
            <input {...register('endereco.bairro')} placeholder="Seu bairro" />
          </div>
        </>
      );
    };

    export default FormularioEndereco;
    

