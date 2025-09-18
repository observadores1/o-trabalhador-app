    // src/components/GerenciadorDeFoto.js
    // NOVO COMPONENTE DEDICADO PARA GERENCIAR A FOTO DE PERFIL

    import React, { useState } from 'react';
    import { useAuth } from '../contexts/AuthContext';
    import { supabase } from '../services/supabaseClient';
    import imageCompression from 'browser-image-compression';

    const GerenciadorDeFoto = ({ watch, setValue }) => {
      const { user } = useAuth();
      // 1. O estado 'isSaving' (renomeado para 'isUploading' para clareza) agora vive aqui.
      const [isUploading, setIsUploading] = useState(false);

      // 2. A lógica de upload, a mais complexa, está totalmente encapsulada aqui.
      const handleFotoUpload = async (event) => {
        if (!user) return;
        const file = event.target.files[0]; // Corrigido para pegar o primeiro arquivo
        if (!file) return;

        setIsUploading(true);
        const fotoAntigaUrl = watch('foto_perfil_url');
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };

        try {
          const compressedFile = await imageCompression(file, options);
          const novoFilePath = `public/${user.id}-${Date.now()}`;
          
          await supabase.storage.from("fotos-de-perfil").upload(novoFilePath, compressedFile);

          if (fotoAntigaUrl) {
            const nomeArquivoAntigo = fotoAntigaUrl.split('/').pop();
            if (nomeArquivoAntigo) {
              await supabase.storage.from('fotos-de-perfil').remove([`public/${nomeArquivoAntigo}`]);
            }
          }

          const { data: { publicUrl } } = supabase.storage.from("fotos-de-perfil").getPublicUrl(novoFilePath);
          setValue("foto_perfil_url", publicUrl, { shouldDirty: true });
          alert("✅ Foto atualizada! Clique em 'Salvar Alterações' no final da página para confirmar.");

        } catch (error) {
          console.error("Erro no processo de atualização da foto:", error);
          alert("❌ Erro ao atualizar a foto. Tente novamente.");
        } finally {
          setIsUploading(false);
        }
      };

      // 3. O JSX para a pré-visualização e o botão de upload também foram movidos.
      return (
        <>
          {watch('foto_perfil_url') && (
            <img 
              src={watch('foto_perfil_url')} 
              alt="Prévia da foto" 
              className="foto-preview" // Esta classe vem do PerfilProfissional.css
            />
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFotoUpload} 
            id="foto-upload"
            style={{ display: 'none' }}
            disabled={isUploading} // Desabilita o input durante o upload
          />
          <label htmlFor="foto-upload" className={`btn btn-secondary ${isUploading ? 'disabled' : ''}`}>
            {isUploading ? 'Enviando...' : 'Escolher Nova Foto'}
          </label>
        </>
      );
    };

    export default GerenciadorDeFoto;
    

