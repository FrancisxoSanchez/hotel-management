// src/prisma/detallehabitacion.ts

import { getRoomTypeById } from './habitacion'
import type { RoomType } from '@prisma/client'

export type RoomDetailData = RoomType

/**
 * Obtiene un tipo de habitación específico por su ID
 * Solo retorna tipos de habitación activos
 */
export async function getRoomById(id: string): Promise<RoomDetailData | null> {
  return await getRoomTypeById(id)
}