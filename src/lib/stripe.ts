// src/lib/stripe.ts

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está configurado en las variables de entorno');
}

// Inicializar Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

interface CreatePaymentIntentParams {
  amount: number; // en centavos (ej: 10000 = $100.00)
  currency?: string;
  metadata?: Record<string, string>;
}

/**
 * Crea un Payment Intent de Stripe
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const { amount, currency = 'ars', metadata = {} } = params;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata as Record<string, string>,
    });

    return paymentIntent;
  } catch (error: any) {
    console.error('[STRIPE] Error al crear Payment Intent:', error);
    throw new Error(`Error al procesar el pago: ${error.message}`);
  }
}

/**
 * Confirma un pago y verifica su estado
 */
export async function confirmPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error: any) {
    console.error('[STRIPE] Error al confirmar pago:', error);
    return false;
  }
}

/**
 * Crea un reembolso
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Si no se especifica, reembolsa el monto completo
    });

    return refund;
  } catch (error: any) {
    console.error('[STRIPE] Error al crear reembolso:', error);
    throw new Error(`Error al procesar el reembolso: ${error.message}`);
  }
}