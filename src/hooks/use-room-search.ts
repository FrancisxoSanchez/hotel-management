// src/hooks/use-room-search.ts

import { useState, useEffect, useCallback } from 'react';

interface RoomType {
  id: string;
  name: string;
  description: string;
  images: string[];
  maxGuests: number;
  basePrice: number;
  features: string[];
  includesBreakfast: boolean;
  includesSpa: boolean;
  isActive: boolean;
  availableCount: number;
}

interface SearchFilters {
  guests: string;
  checkIn?: Date;
  checkOut?: Date;
}

interface UseRoomSearchReturn {
  rooms: RoomType[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (filters: SearchFilters) => Promise<void>;
  reset: () => void;
}

/**
 * Hook personalizado para manejar la búsqueda de habitaciones
 * Separa la lógica de negocio de la UI
 */
export function useRoomSearch(): UseRoomSearchReturn {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const params = new URLSearchParams();

    if (filters.guests && filters.guests !== 'all') {
      params.append('guests', filters.guests);
    }
    if (filters.checkIn) {
      params.append('checkIn', filters.checkIn.toISOString());
    }
    if (filters.checkOut) {
      params.append('checkOut', filters.checkOut.toISOString());
    }

    try {
      const response = await fetch(`/api/clientes/habitacion?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar las habitaciones');
      }

      const data = await response.json();
      setRooms(data.data || data);
    } catch (err: any) {
      setError(err.message);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRooms([]);
    setIsLoading(false);
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    rooms,
    isLoading,
    error,
    hasSearched,
    search,
    reset,
  };
}

/**
 * Hook para validar filtros de búsqueda en tiempo real
 */
export function useSearchValidation(checkIn?: Date, checkOut?: Date) {
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);

    if (!checkIn && !checkOut) return;

    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      setValidationError('Debe seleccionar ambas fechas');
      return;
    }

    if (checkIn && checkOut) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        setValidationError('La fecha de entrada no puede ser en el pasado');
        return;
      }

      if (checkOut <= checkIn) {
        setValidationError('La fecha de salida debe ser posterior a la de entrada');
        return;
      }

      // Verificar al menos 1 noche
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        setValidationError('La reserva debe ser de al menos 1 noche');
        return;
      }
    }
  }, [checkIn, checkOut]);

  return validationError;
}