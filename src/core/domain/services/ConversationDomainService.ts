
/**
 * @fileoverview Servicio de dominio para conversaciones
 * @module domain/services/ConversationDomainService
 */

import { Conversation } from '../Message';

/**
 * Servicio de dominio para operaciones relacionadas con conversaciones
 */
export class ConversationDomainService {
  /**
   * Valida una nueva conversación
   * @param productId ID del producto
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   */
  static validateNewConversation(
    productId: string,
    userId: string,
    companyId: string
  ): boolean {
    return Boolean(productId && userId && companyId);
  }

  /**
   * Calcula el incremento del contador de mensajes no leídos
   * @param currentCount Contador actual
   */
  static calculateUnreadIncrement(currentCount: number): number {
    return currentCount + 1;
  }
}
