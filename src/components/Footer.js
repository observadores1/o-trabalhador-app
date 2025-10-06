// src/components/Footer.js - VERSÃO FINAL, CORRETA E ACESSÍVEL
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';
import InstallPWA from './InstallPWA';

const Footer = ({ installPrompt }) => {
  const { toggleManual } = useAuth();
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <InstallPWA prompt={installPrompt} mode="button" />

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

      <p className="footer-help-link">
        <button onClick={( ) => toggleManual(true)} className="link-style-button">
          Precisa de Ajuda?
        </button>
      </p>

      <p className="copyright-text">&copy; {anoAtual} @CertaSoluções. Todos os direitos reservados.</p>
    </footer>
    );
};

export default Footer;
