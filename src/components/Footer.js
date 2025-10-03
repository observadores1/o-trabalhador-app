// src/components/Footer.js - CÓDIGO ATUALIZADO

import React from 'react';
import InstallPWA from './InstallPWA'; // ===== 1. IMPORTE O COMPONENTE AQUI =====
import './Footer.css';

const Footer = () => {
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

      {/* ===== 2. ADICIONE O COMPONENTE AQUI, NO MEIO ===== */}
      <div className="install-section">
        <InstallPWA mode="button" />
      </div>

      <p className="copyright-text">&copy; {anoAtual} @CertaSoluções. Todos os direitos reservados.</p>
    </footer>
    );
};

export default Footer;
