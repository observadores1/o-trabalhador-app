    // src/components/SeletorDeHabilidades.js
    // NOVO COMPONENTE DEDICADO PARA GERENCIAR HABILIDADES

    import React, { useState, useEffect } from 'react';
    import { supabase } from '../services/supabaseClient';

    const SeletorDeHabilidades = ({ watch, setValue }) => {
      // 1. A lógica de estado e busca de habilidades agora vive aqui.
      const [listaDeHabilidades, setListaDeHabilidades] = useState([]);
      const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
        const buscarHabilidades = async () => {
          setIsLoading(true);
          try {
            const { data, error } = await supabase
              .from('habilidades')
              .select('nome')
              .order('nome', { ascending: true });

            if (error) throw error;
            if (data) setListaDeHabilidades(data);

          } catch (error) {
            console.error("Erro ao buscar lista de habilidades:", error);
            // Poderíamos adicionar uma mensagem de erro na UI aqui se quiséssemos.
          } finally {
            setIsLoading(false);
          }
        };
        buscarHabilidades();
      }, []); // Este useEffect roda apenas uma vez, quando o componente é montado.

      // 2. A função para manipular a mudança de um checkbox também foi movida para cá.
      const handleHabilidadeChange = (habilidade, isChecked) => {
        const habilidadesAtuais = watch('habilidades') || [];
        if (isChecked) {
          // Adiciona a habilidade ao array no formulário principal
          setValue('habilidades', [...habilidadesAtuais, habilidade], { shouldDirty: true });
        } else {
          // Remove a habilidade do array no formulário principal
          setValue('habilidades', habilidadesAtuais.filter(h => h !== habilidade), { shouldDirty: true });
        }
      };

      if (isLoading) {
        return <p>Carregando habilidades...</p>;
      }

      return (
        <div className="habilidades-grid">
          {listaDeHabilidades.map((habilidade) => (
            <label key={habilidade.nome} className="habilidade-item">
              <input
                type="checkbox"
                value={habilidade.nome}
                // Verifica se a habilidade atual está no array de habilidades do formulário
                checked={(watch('habilidades') || []).includes(habilidade.nome)}
                onChange={(e) => handleHabilidadeChange(habilidade.nome, e.target.checked)}
              />
              {habilidade.nome}
            </label>
          ))}
        </div>
      );
    };

    export default SeletorDeHabilidades;
    

