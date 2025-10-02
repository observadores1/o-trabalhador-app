// supabase/functions/webhook-pagseguro/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Cabeçalhos CORS para a resposta
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req ) => {
  // Responde a requisições OPTIONS (necessário para CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. RECEBER E VALIDAR A NOTIFICAÇÃO DO PAGSEGURO
    const notification = await req.json();
    console.log('Webhook recebido:', JSON.stringify(notification, null, 2));

    // Verificamos se o pagamento foi realmente pago (PAID)
    if (notification.charges[0].status !== 'PAID') {
      console.log(`Status do pagamento não é 'PAID'. É '${notification.charges[0].status}'. Ignorando.`);
      return new Response('Notificação não relevante.', { status: 200 });
    }

    // 2. EXTRAIR INFORMAÇÕES IMPORTANTES
    // Pegamos o reference_id que criamos na outra função. Ex: "assinatura_USERID_TIMESTAMP"
    const referenceId = notification.reference_id;
    if (!referenceId) {
      throw new Error('reference_id não encontrado na notificação.');
    }

    // Quebramos o reference_id em partes para saber o que fazer
    const [tipoPagamento, userId] = referenceId.split('_');
    if (!tipoPagamento || !userId) {
      throw new Error('Formato do reference_id inválido.');
    }

    // 3. CONECTAR AO SUPABASE PARA ATUALIZAR O BANCO DE DADOS
    // Criamos um cliente Supabase com permissões de administrador para poder escrever nas tabelas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. EXECUTAR A LÓGICA CORRETA PARA CADA TIPO DE PAGAMENTO
    console.log(`Processando pagamento do tipo '${tipoPagamento}' para o usuário '${userId}'`);

    if (tipoPagamento === 'assinatura') {
      // LÓGICA PARA ATIVAR A ASSINATURA DO TRABALHADOR
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 30); // Adiciona 30 dias a partir de hoje

      const { error } = await supabaseAdmin
        .from('assinaturas_trabalhador')
        .upsert({
          trabalhador_id: userId,
          status_assinatura: 'ativa',
          data_inicio: new Date().toISOString(),
          data_fim: dataFim.toISOString(),
          pagseguro_order_id: notification.id, // Guarda o ID do pedido para referência
        }, { onConflict: 'trabalhador_id' }); // Se já existe, atualiza. Se não, cria.

      if (error) throw error;
      console.log(`Assinatura do trabalhador ${userId} ativada/renovada com sucesso.`);

    } else if (tipoPagamento === 'taxa_os') {
      // LÓGICA PARA REGISTRAR O PAGAMENTO DA TAXA DO CONTRATANTE
      const { error } = await supabaseAdmin
        .from('pagamentos_contratante')
        .insert({
          contratante_id: userId,
          valor_pago: notification.charges[0].amount.value / 100, // Converte de centavos para reais
          pagseguro_order_id: notification.id,
        });

      if (error) throw error;
      console.log(`Pagamento de taxa de OS para o contratante ${userId} registrado com sucesso.`);
    
    } else {
      console.warn(`Tipo de pagamento desconhecido: ${tipoPagamento}`);
    }

    // 5. RESPONDER AO PAGSEGURO COM SUCESSO
    // É crucial responder com status 200 para que o PagSeguro saiba que recebemos o aviso.
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no webhook do PagSeguro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Retorna um erro para indicar que algo deu errado
    });
  }
});
