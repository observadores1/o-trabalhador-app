// src/components/Footer.js - CÓDIGO ATUALIZADO

import React from 'react';
import InstallPWA from './InstallPWA';
import './Footer.css';

// ===== 1. ALTERAR A ASSINATURA PARA RECEBER 'installPrompt' =====
const Footer = ({ installPrompt }) => {
  const anoAtual = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p className="investor-call">
        Quer ser um investidor deste aplicativo? 
        <a 
          href="https://wa.me/5546999374626?text=Ol%C3%A1%2C+tenho+interesse+em+investir+no+aplicativo+O+Trabalhador." 
          target="_blank" 
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          Chama no WhatsApp
        </a>
      </p>

      <div className="install-section">
        {/* ===== 2. PASSAR A PROP RECEBIDA PARA O COMPONENTE 'InstallPWA' ===== */}
        <InstallPWA prompt={installPrompt} mode="button" />
      </div>

      <p className="copyright-text">&copy; {anoAtual} @CertaSoluções. Todos os direitos reservados.</p>
    </footer>
     );
};

export default Footer;
