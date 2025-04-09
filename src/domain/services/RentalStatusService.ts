
/**
 * @fileoverview Servicio de dominio para operaciones con estados de alquileres
 */

import { Rental } from '../models/Rental';

export class RentalStatusService {
  /**
   * Actualiza el estado de un alquiler
   * @param rental El alquiler actual
   * @param newStatus El nuevo estado
   * @returns El alquiler actualizado
   */
  static updateRentalStatus(
    rental: Rental, 
    newStatus: 'active' | 'upcoming' | 'completed'
  ): Rental {
    // Para "completed" status, marcar como devuelto
    const returned = newStatus === 'completed' ? true : rental.returned;
    
    return {
      ...rental,
      status: newStatus,
      returned: returned || rental.returned // Mantener devuelto true si ya era true
    };
  }

  /**
   * Obtiene la etiqueta legible en español para un estado
   */
  static getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'upcoming': return 'Próximo';
      case 'completed': return 'Completado';
      default: return status;
    }
  }

  /**
   * Obtiene las clases CSS para una insignia de estado
   */
  static getStatusBadgeClasses(status: string): string {
    switch (status) {
      case 'active': 
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'upcoming': 
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'completed': 
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: 
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  }
}
