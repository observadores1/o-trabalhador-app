// supabase/functions/gerar-pix-assinatura/index.ts - VERSÃO 4.1 (SANDBOX + CÂMERAS)

console.log("[INFO] Função 'gerar-pix-assinatura' v4.1 (Sandbox + Câmeras) inicializando...");

// CONTROLE CENTRAL: Mude para 'false' para ir para o ambiente de produção
const isSandbox = true;

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[CÂMERA 1] Requisição recebida.');
    const { nome, email, cpf, valor, tipoPagamento, userId } = await req.json();
    
    console.log(`[CÂMERA 2] Dados recebidos: CPF=${cpf}, Nome=${nome}, Valor=${valor}`);

    if (!cpf || String(cpf).length < 11) {
      throw new Error(`CPF ausente ou inválido. Valor recebido: ${cpf}`);
    }

    const tokenEnvVar = isSandbox ? 'PAGSEGURO_SANDBOX_TOKEN' : 'PAGSEGURO_TOKEN';
    const pagseguroToken = Deno.env.get(tokenEnvVar);

    if (!pagseguroToken) {
      throw new Error(`Token para o ambiente ${isSandbox ? 'Sandbox' : 'Produção'} (${tokenEnvVar}) não foi encontrado.`);
    }
    console.log(`[CÂMERA 3] Operando em modo ${isSandbox ? 'Sandbox' : 'Produção'}. Token lido com sucesso.`);

    const apiUrl = isSandbox 
      ? "https://sandbox.api.pagseguro.com/orders" 
      : "https://api.pagseguro.com/orders";

    const corpoRequisicao = {
      reference_id: `order-${tipoPagamento}-${Date.now( )}`,
      customer: { name: nome, email: email, tax_id: String(cpf).replace(/\D/g, '') },
      items: [{
        name: tipoPagamento === 'assinatura' ? 'Assinatura Mensal (Teste)' : 'Taxa de Serviço (Teste)',
        quantity: 1,
        unit_amount: Math.round(valor * 100),
      }],
      qr_codes: [{
        amount: { value: Math.round(valor * 100) },
        expiration_date: new Date(Date.now() + 3600 * 1000).toISOString(),
      }],
    };

    console.log(`[CÂMERA 4] Enviando para ${apiUrl}...`);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pagseguroToken}` },
      body: JSON.stringify(corpoRequisicao),
    });

    console.log(`[CÂMERA 5] Resposta do PagSeguro - Status: ${response.status}`);
    const responseBody = await response.json();

    if (!response.ok) {
      console.error('[CÂMERA 6 - A VERDADE] Erro do PagSeguro:', responseBody);
      throw new Error(`Erro do PagSeguro: ${JSON.stringify(responseBody.error_messages || responseBody)}`);
    }

    const qrCode = responseBody.qr_codes[0];
    console.log('[SUCESSO] Cobrança PIX de TESTE gerada.');

    return new Response(
      JSON.stringify({
        orderId: responseBody.id,
        qrCodeText: qrCode.text,
        qrCodeImageUrl: qrCode.links.find(link => link.rel === 'QRCODE.PNG').href,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ERRO INESPERADO] Bloco catch ativado:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
