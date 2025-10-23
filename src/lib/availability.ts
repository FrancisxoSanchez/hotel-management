import type { Room, Reservation } from "./types"

export function getAvailableRoomNumbers(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date,
  reservations: Reservation[],
  rooms: Room[],
): number[] {
  const room = rooms.find((r) => r.id === roomId)
  if (!room) return []

  const allRoomNumbers = Array.from({ length: room.quantity }, (_, i) => i + 1)

  const occupiedRoomNumbers = reservations
    .filter((r) => {
      if (r.roomId !== roomId || r.status === "cancelada") return false

      // Check if dates overlap
      const reservationStart = new Date(r.checkInDate)
      const reservationEnd = new Date(r.checkOutDate)
      const requestStart = new Date(checkInDate)
      const requestEnd = new Date(checkOutDate)

      return requestStart < reservationEnd && requestEnd > reservationStart
    })
    .map((r) => r.roomNumber)

  return allRoomNumbers.filter((num) => !occupiedRoomNumbers.includes(num))
}

export function getAvailableRoomsCount(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date,
  reservations: Reservation[],
  rooms: Room[],
): number {
  return getAvailableRoomNumbers(roomId, checkInDate, checkOutDate, reservations, rooms).length
}

export function isRoomAvailable(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date,
  reservations: Reservation[],
  rooms: Room[],
): boolean {
  return getAvailableRoomsCount(roomId, checkInDate, checkOutDate, reservations, rooms) > 0
}
