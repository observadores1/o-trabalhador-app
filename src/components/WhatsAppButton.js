import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  return (
    <a 
      href="https://wa.me/5546999374626?text=O%20Trabalhador%20-%20preciso%20de%20ajuda."
      className="whatsapp-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp" />
    </a>
  );
};

export default WhatsAppButton;


