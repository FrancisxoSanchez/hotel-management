// src/lib/sendgrid.ts

import sgMail from '@sendgrid/mail';

// Inicializar SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY no está configurado');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface ReservationEmailData {
  customerName: string;
  customerEmail: string;
  reservationId: string;
  roomName: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  totalPrice: number;
  includesBreakfast: boolean;
  includesSpa: boolean;
}

/**
 * Envía email de confirmación de reserva al cliente
 */
export async function sendReservationConfirmation(data: ReservationEmailData): Promise<void> {
  const {
    customerName,
    customerEmail,
    reservationId,
    roomName,
    roomId,
    checkInDate,
    checkOutDate,
    nights,
    guests,
    totalPrice,
    includesBreakfast,
    includesSpa,
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Reserva</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .card {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #666;
          }
          .value {
            color: #333;
          }
          .total {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e0e7ff;
            color: #667eea;
            border-radius: 12px;
            font-size: 12px;
            margin: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>¡Reserva Confirmada! ✓</h1>
          <p>Gracias por elegir nuestro hotel</p>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${customerName}</strong>,</p>
          
          <p>Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:</p>
          
          <div class="card">
            <h2 style="margin-top: 0; color: #667eea;">Detalles de la Reserva</h2>
            
            <div class="info-row">
              <span class="label">Número de Reserva:</span>
              <span class="value"><strong>#${reservationId.slice(0, 8).toUpperCase()}</strong></span>
            </div>
            
            <div class="info-row">
              <span class="label">Habitación:</span>
              <span class="value">${roomName} - Habitación ${roomId}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Check-in:</span>
              <span class="value">${checkInDate}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Check-out:</span>
              <span class="value">${checkOutDate}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Noches:</span>
              <span class="value">${nights} noche${nights > 1 ? 's' : ''}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Huéspedes:</span>
              <span class="value">${guests} persona${guests > 1 ? 's' : ''}</span>
            </div>
          </div>

          ${includesBreakfast || includesSpa ? `
            <div class="card">
              <h3 style="margin-top: 0;">Servicios Incluidos</h3>
              ${includesBreakfast ? '<span class="badge">☕ Desayuno Buffet</span>' : ''}
              ${includesSpa ? '<span class="badge">✨ Acceso al Spa</span>' : ''}
            </div>
          ` : ''}
          
          <div class="total">
            Total Pagado: $${totalPrice.toLocaleString('es-AR')}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/cliente/mis-reservas" class="button">
              Ver Mi Reserva
            </a>
          </div>
          
          <div class="card" style="background: #fff3cd; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0;">Información Importante</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>El check-in se realiza a partir de las 15:00 hs</li>
              <li>El check-out debe realizarse antes de las 11:00 hs</li>
              <li>Por favor trae tu documento de identidad</li>
              <li>Puedes gestionar tu reserva desde tu cuenta</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">
            Si tienes alguna pregunta o necesitas realizar cambios en tu reserva, 
            no dudes en contactarnos.
          </p>
          
          <p>¡Esperamos verte pronto!</p>
          
          <p style="margin-top: 30px;">
            Saludos cordiales,<br>
            <strong>Equipo de ${process.env.SENDGRID_FROM_NAME || 'Hotel Management'}</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>
            Este es un email automático, por favor no respondas a este mensaje.<br>
            Para contactarnos, visita nuestra página web.
          </p>
          <p style="color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} ${process.env.SENDGRID_FROM_NAME || 'Hotel Management'}. Todos los derechos reservados.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Confirmación de Reserva

Estimado/a ${customerName},

Tu reserva ha sido confirmada exitosamente.

DETALLES DE LA RESERVA
-----------------------
Número de Reserva: #${reservationId.slice(0, 8).toUpperCase()}
Habitación: ${roomName} - Habitación ${roomId}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Noches: ${nights}
Huéspedes: ${guests}

${includesBreakfast ? '✓ Incluye Desayuno Buffet\n' : ''}${includesSpa ? '✓ Incluye Acceso al Spa\n' : ''}

Total Pagado: $${totalPrice.toLocaleString('es-AR')}

INFORMACIÓN IMPORTANTE
----------------------
- El check-in se realiza a partir de las 15:00 hs
- El check-out debe realizarse antes de las 11:00 hs
- Por favor trae tu documento de identidad

Para gestionar tu reserva, visita: ${process.env.NEXT_PUBLIC_APP_URL}/cliente/mis-reservas

¡Esperamos verte pronto!

Saludos cordiales,
Equipo de ${process.env.SENDGRID_FROM_NAME || 'Hotel Management'}
  `;

  const msg = {
    to: customerEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@hotel.com',
      name: process.env.SENDGRID_FROM_NAME || 'Hotel Management',
    },
    subject: `Confirmación de Reserva #${reservationId.slice(0, 8).toUpperCase()} - ${roomName}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`[SENDGRID] Email enviado exitosamente a ${customerEmail}`);
  } catch (error: any) {
    console.error('[SENDGRID] Error al enviar email:', error);
    if (error.response) {
      console.error('[SENDGRID] Detalles:', error.response.body);
    }
    throw new Error('Error al enviar email de confirmación');
  }
}

/**
 * Envía email de notificación al hotel (opcional)
 */
export async function sendNewReservationNotification(data: ReservationEmailData): Promise<void> {
  const hotelEmail = process.env.HOTEL_NOTIFICATION_EMAIL;
  
  if (!hotelEmail) {
    console.log('[SENDGRID] No hay email de notificación configurado');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Nueva Reserva Recibida</h2>
        <p><strong>Número de Reserva:</strong> ${data.reservationId}</p>
        <p><strong>Cliente:</strong> ${data.customerName} (${data.customerEmail})</p>
        <p><strong>Habitación:</strong> ${data.roomName} - ${data.roomId}</p>
        <p><strong>Check-in:</strong> ${data.checkInDate}</p>
        <p><strong>Check-out:</strong> ${data.checkOutDate}</p>
        <p><strong>Huéspedes:</strong> ${data.guests}</p>
        <p><strong>Total:</strong> $${data.totalPrice.toLocaleString('es-AR')}</p>
      </body>
    </html>
  `;

  const msg = {
    to: hotelEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@hotel.com',
      name: process.env.SENDGRID_FROM_NAME || 'Hotel Management',
    },
    subject: `Nueva Reserva - ${data.roomName}`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`[SENDGRID] Notificación enviada al hotel`);
  } catch (error) {
    console.error('[SENDGRID] Error al enviar notificación al hotel:', error);
    // No lanzamos error porque esto es secundario
  }
}