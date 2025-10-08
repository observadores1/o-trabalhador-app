// src/components/PixelTracker.js - NOVO ARQUIVO
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';

const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Dispara um evento PageView padrão toda vez que a localização (URL) muda
    ReactPixel.pageView();
    
    // A linha abaixo é opcional, apenas para você ver no console do navegador que está funcionando
    console.log(`[Facebook Pixel] PageView disparado para: ${location.pathname}`);

  }, [location]); // A mágica acontece aqui: o efeito re-executa sempre que 'location' muda

  return null; // Este componente não renderiza nada visível na tela
};

export default PixelTracker;
