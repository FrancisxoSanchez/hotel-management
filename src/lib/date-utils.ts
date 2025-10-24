// src/lib/date-utils.ts

import { differenceInDays, isAfter, isBefore, startOfDay } from "date-fns";

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida un rango de fechas para reservas
 */
export function validateReservationDates(
  checkIn: Date | undefined,
  checkOut: Date | undefined
): DateValidationResult {
  // Ambas fechas deben estar presentes o ambas ausentes
  if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
    return {
      isValid: false,
      error: "Debe seleccionar ambas fechas (Check-in y Check-out)",
    };
  }

  // Si no hay fechas, es válido (búsqueda sin fechas)
  if (!checkIn || !checkOut) {
    return { isValid: true };
  }

  const today = startOfDay(new Date());
  const checkInDay = startOfDay(checkIn);
  const checkOutDay = startOfDay(checkOut);

  // Check-in no puede ser en el pasado
  if (isBefore(checkInDay, today)) {
    return {
      isValid: false,
      error: "La fecha de Check-in no puede ser en el pasado",
    };
  }

  // Check-out debe ser después de Check-in
  if (!isAfter(checkOutDay, checkInDay)) {
    return {
      isValid: false,
      error: "La fecha de Check-out debe ser posterior a la de Check-in",
    };
  }

  // Debe haber al menos 1 noche
  const nights = differenceInDays(checkOutDay, checkInDay);
  if (nights < 1) {
    return {
      isValid: false,
      error: "La reserva debe ser de al menos 1 noche",
    };
  }

  // Opcional: Limitar reservas muy largas (ej: máximo 30 días)
  if (nights > 30) {
    return {
      isValid: false,
      error: "La reserva no puede exceder 30 noches. Contacte recepción para estadías más largas",
    };
  }

  return { isValid: true };
}

/**
 * Calcula el número de noches entre dos fechas
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  return differenceInDays(startOfDay(checkOut), startOfDay(checkIn));
}

/**
 * Normaliza una fecha a medianoche UTC para consistencia
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}