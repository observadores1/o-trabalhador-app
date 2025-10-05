// src/components/Footer.js - VERSÃO CORRIGIDA E COMPLETA COM BOTÃO PWA
import React from 'react';
import './Footer.css';
import InstallPWA from './InstallPWA'; // Importa o componente PWA

const Footer = ({ installPrompt }) => { // Recebe a prop 'installPrompt'
  const anoAtual = new Date().getFullYear();
  return (
    <footer className="app-footer">
      {/* ===== INÍCIO DA CORREÇÃO PWA ===== */}
      {/* Renderiza o botão de instalação apenas se o evento foi capturado */}
      <InstallPWA prompt={installPrompt} mode="button" />
      {/* ===== FIM DA CORREÇÃO PWA ===== */}

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
      <p className="copyright-text">&copy; {anoAtual} @CertaSoluções. Todos os direitos reservados.</p>
    </footer>
    );
};

export default Footer;
