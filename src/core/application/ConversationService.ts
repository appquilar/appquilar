
/**
 * @fileoverview Servicio de aplicación para gestionar conversaciones
 * @module application/ConversationService
 */

import { Conversation } from "../domain/Message";
import { MessageRepository } from "../ports/MessageRepository";

/**
 * Servicio de aplicación para gestionar las conversaciones
 */
export class ConversationService {
  private repository: MessageRepository;
  
  constructor(repository: MessageRepository) {
    this.repository = repository;
  }
  
  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.repository.getUserConversations(userId);
  }
  
  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    return this.repository.getUnreadMessageCounts(userId);
  }
  
  /**
   * Crea una nueva conversación
   * @param productId ID del producto
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   */
  async createConversation(
    productId: string,
    userId: string,
    companyId: string
  ): Promise<Conversation> {
    return this.repository.startConversation(productId, userId, companyId, "");
  }
  
  /**
   * Actualiza los datos de la conversación al enviar un nuevo mensaje
   * @param conversationId ID de la conversación
   * @param isCompanyMessage Indica si el mensaje es de la empresa
   */
  async updateConversationOnNewMessage(
    conversationId: string,
    isCompanyMessage: boolean
  ): Promise<void> {
    // Esta funcionalidad podría implementarse a nivel de base de datos
    console.log(`Actualización de conversación ${conversationId} con mensaje de ${isCompanyMessage ? 'empresa' : 'usuario'}`);
  }
  
  /**
   * Resetea el contador de mensajes no leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario
   */
  async resetUnreadCounter(conversationId: string, userId: string): Promise<void> {
    return this.repository.markMessagesAsRead(conversationId, userId);
  }
}
