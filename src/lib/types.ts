// User roles
export type UserRole = "cliente" | "operador" | "gerencia"

// Reservation status
export type ReservationStatus = "pendiente" | "confirmada" | "finalizada" | "cancelada"

// User type
export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  phone?: string
  createdAt: Date
}

// Guest information
export interface Guest {
  id: string
  name: string
  dni: string
  email: string
  phone: string
}

// Room type
export interface Room {
  id: string
  name: string
  description: string
  maxGuests: number
  basePrice: number
  images: string[]
  amenities: string[]
  isActive: boolean
  includesBreakfast: boolean
  includesSpa: boolean
  quantity: number // Added quantity field to track how many rooms of this type exist
}

// Reservation type
export interface Reservation {
  id: string
  roomId: string
  roomNumber: number // Added roomNumber to identify specific room instance
  userId: string
  guests: Guest[]
  checkInDate: Date
  checkOutDate: Date
  status: ReservationStatus
  totalPrice: number
  depositPaid: number
  includesBreakfast: boolean
  includesSpa: boolean
  createdAt: Date
  cancelledAt?: Date
}

// Amenity type
export interface Amenity {
  id: string
  name: string
  description: string
  images: string[]
}

// Consultation type
export interface Consultation {
  id: string
  email: string
  message: string
  response?: string
  isAttended: boolean
  createdAt: Date
  attendedAt?: Date
  attendedBy?: string
}
