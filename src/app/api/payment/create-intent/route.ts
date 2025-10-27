// src/app/api/payment/create-intent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/stripe';

const createIntentSchema = z.object({
  amount: z.number().positive('Monto debe ser positivo'),
  reservationId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  roomTypeId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validation = createIntentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { amount, reservationId, userId, roomTypeId } = validation.data;

    // Convertir a centavos (Stripe trabaja con centavos)
    const amountInCents = Math.round(amount * 100);

    // Preparar metadata (solo incluir valores que existan)
    const metadata: Record<string, string> = {};
    if (reservationId) metadata.reservationId = reservationId;
    if (userId) metadata.userId = userId;
    if (roomTypeId) metadata.roomTypeId = roomTypeId;

    // Crear Payment Intent
    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      currency: 'ars',
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('[API_CREATE_PAYMENT_INTENT]', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar el pago',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';