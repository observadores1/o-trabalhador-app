// src/components/ModalManual.js - NOVO ARQUIVO
import React from 'react';
import './ModalManual.css';

const ModalManual = ({ perfil, onClose }) => {
  const conteudoTrabalhador = (
    <>
      <h2>Guia Rápido do Trabalhador</h2>
      <p>Bem-vindo! Aqui estão os passos essenciais:</p>
      <ul>
        <li><strong>1. Complete seu Perfil:</strong> Vá em "Perfil" e preencha suas habilidades, experiências e foto. Um perfil completo atrai mais contratantes.</li>
        <li><strong>2. Encontre Oportunidades:</strong> Na aba "Oportunidades", você verá todos os serviços disponíveis na sua área.</li>
        <li><strong>3. Faça Propostas:</strong> Se gostar de um serviço, envie sua proposta. Capriche na descrição!</li>
        <li><strong>4. Realize o Trabalho:</strong> Após ser aceito, combine os detalhes com o contratante e realize o serviço com excelência.</li>
        <li><strong>5. Receba sua Avaliação:</strong> Boas avaliações aumentam sua reputação na plataforma.</li>
      </ul>
    </>
  );

  const conteudoContratante = (
    <>
      <h2>Guia Rápido do Contratante</h2>
      <p>Encontre o profissional perfeito para o seu serviço:</p>
      <ul>
        <li><strong>1. Crie uma Oferta de Serviço:</strong> Clique em "Criar Oferta de Serviço" e descreva detalhadamente o que você precisa.</li>
        <li><strong>2. Receba Propostas:</strong> Profissionais interessados enviarão propostas para o seu serviço.</li>
        <li><strong>3. Analise e Contrate:</strong> Visite o perfil dos candidatos, analise suas avaliações e escolha o melhor profissional para o trabalho.</li>
        <li><strong>4. Acompanhe o Serviço:</strong> Use nossa plataforma para acompanhar o andamento do serviço.</li>
        <li><strong>5. Avalie o Profissional:</strong> Após a conclusão, sua avaliação é fundamental para manter a qualidade da nossa comunidade.</li>
      </ul>
    </>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-manual-container">
        <div className="modal-manual-header">
          {perfil === 'trabalhador' ? conteudoTrabalhador : conteudoContratante}
        </div>
        <div className="modal-manual-footer">
          <button onClick={onClose} className="btn btn-success">
            Entendi, fechar manual
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalManual;
