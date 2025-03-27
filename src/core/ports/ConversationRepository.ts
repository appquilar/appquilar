
/**
 * @fileoverview Puerto para el repositorio de conversaciones
 * @module ports/ConversationRepository
 */

import { Conversation } from "../domain/Message";

/**
 * Puerto de repositorio para la gestión de conversaciones
 */
export interface ConversationRepository {
  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   */
  getUserConversations(userId: string): Promise<Conversation[]>;
  
  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   */
  getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>>;
  
  /**
   * Crea una nueva conversación
   * @param productId ID del producto
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   */
  createConversation(
    productId: string,
    userId: string,
    companyId: string
  ): Promise<Conversation>;
  
  /**
   * Actualiza los datos de la conversación al enviar un nuevo mensaje
   * @param conversationId ID de la conversación
   * @param isCompanyMessage Indica si el mensaje es de la empresa
   */
  updateConversationOnNewMessage(
    conversationId: string,
    isCompanyMessage: boolean
  ): Promise<void>;
  
  /**
   * Resetea el contador de mensajes no leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario
   */
  resetUnreadCounter(conversationId: string, userId: string): Promise<void>;
}
