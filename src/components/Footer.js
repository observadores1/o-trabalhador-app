/**
 * @file Footer.js
 * @description Componente de rodapé reutilizável para o aplicativo.
 * @author Jeferson Gnoatto
 * @date 2025-09-19
 * Louvado seja Cristo, Louvado seja Deus
 */
import React from 'react';
import './Footer.css';

const Footer = () => {
  const anoAtual = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>&copy; {anoAtual} @CertaSoluções. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
