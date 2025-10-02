// src/components/ModalPagamentoPix.js - CORRIGIDO SEM AVISOS

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './ModalPagamentoPix.css';

const ModalPagamentoPix = ({ tipoPagamento, valor, onClose, onPaymentSuccess }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(''); // AGORA SERÁ USADO
  const [pixData, setPixData] = useState(null);

  useEffect(() => {
    let paymentSubscription = null;

    const gerarCobrancaPix = async () => {
      if (!user) {
        setError('Usuário não autenticado.');
        setStatus('error');
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('apelido, cpf')
        .eq('id', user.id)
        .single();

      if (perfilError || !perfil || !perfil.cpf) {
        setError('Não foi possível encontrar seus dados ou seu CPF não está cadastrado. Por favor, complete seu perfil.');
        setStatus('error');
        return;
      }

      try {
        setStatus('loading');
        const { data, error: functionError } = await supabase.functions.invoke('gerar-pix-assinatura', {
          body: {
            nome: perfil.apelido,
            email: user.email,
            cpf: perfil.cpf,
            valor: valor,
            tipoPagamento: tipoPagamento,
            userId: user.id,
          },
        });

        if (functionError) throw functionError;
        if (data.error) throw new Error(data.error);

        setPixData(data);
        setStatus('ready');

        const tabelaParaOuvir = tipoPagamento === 'assinatura' ? 'assinaturas_trabalhador' : 'pagamentos_contratante';
        const colunaId = tipoPagamento === 'assinatura' ? 'trabalhador_id' : 'contratante_id';

        paymentSubscription = supabase
          .channel(`pagamento-confirmado-${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tabelaParaOuvir, filter: `${colunaId}=eq.${user.id}` },
            (payload) => {
              console.log('Recebido evento do Realtime:', payload);
              if (payload.new?.pagseguro_order_id === data.orderId) {
                setStatus('success');
                if (onPaymentSuccess) onPaymentSuccess();
                if (paymentSubscription) supabase.removeChannel(paymentSubscription);
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Erro ao gerar cobrança PIX:', err);
        setError(`Não foi possível gerar o PIX. Detalhe: ${err.message}`);
        setStatus('error');
      }
    };

    gerarCobrancaPix();

    return () => {
      if (paymentSubscription) {
        supabase.removeChannel(paymentSubscription);
      }
    };
  }, [user, tipoPagamento, valor, onPaymentSuccess]);

  // AGORA SERÁ USADO
  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixData.qrCodeText);
    alert('Código PIX copiado para a área de transferência!');
  };

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="modal-success">
          <div className="success-icon">✓</div>
          <h3>Pagamento Confirmado!</h3>
          <p>Seu acesso foi liberado. Você já pode usar os recursos.</p>
          <button onClick={onClose} className="btn-fechar-sucesso">Ótimo!</button>
        </div>
      );
    }

    if (status === 'loading') {
      return (
        <div className="modal-loading">
          <div className="spinner"></div>
          <p>Gerando seu PIX, aguarde...</p>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="modal-error">
          <h3>Ocorreu um Erro</h3>
          {/* A variável 'error' agora é exibida para o usuário */}
          <p>{error}</p>
          <button onClick={onClose} className="btn-fechar">Fechar</button>
        </div>
      );
    }

    // ===== SEÇÃO REINTRODUZIDA QUE ESTAVA FALTANDO =====
    if (status === 'ready' && pixData) {
      return (
        <>
          <h2>Pague com PIX para Liberar</h2>
          <p>Escaneie o QR Code abaixo com o app do seu banco:</p>
          <div className="qr-code-container">
            <img src={pixData.qrCodeImageUrl} alt="QR Code PIX" />
          </div>
          <p>Ou use o PIX Copia e Cola:</p>
          <button onClick={handleCopyCode} className="btn-copia-cola">
            Clique para Copiar o Código
          </button>
          <p className="aguardando-pagamento">Aguardando confirmação de pagamento...</p>
          <small>Após o pagamento, o acesso será liberado automaticamente.</small>
        </>
      );
    }
    // ======================================================

    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {status !== 'success' && (
          <button onClick={onClose} className="btn-close-modal" aria-label="Fechar">X</button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default ModalPagamentoPix;
