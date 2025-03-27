
/**
 * @fileoverview Servicio de aplicación para conversaciones
 * @module application/ConversationService
 */

import { Conversation } from '../domain/Message';
import { ConversationRepository } from '../ports/ConversationRepository';

/**
 * Servicio de aplicación para operaciones relacionadas con conversaciones
 */
export class ConversationService {
  private conversationRepository: ConversationRepository;

  constructor(conversationRepository: ConversationRepository) {
    this.conversationRepository = conversationRepository;
  }

  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.getUserConversations(userId);
  }

  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    return this.conversationRepository.getUnreadMessageCounts(userId);
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
    return this.conversationRepository.createConversation(productId, userId, companyId);
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
    return this.conversationRepository.updateConversationOnNewMessage(conversationId, isCompanyMessage);
  }

  /**
   * Resetea el contador de mensajes no leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario
   */
  async resetUnreadCounter(conversationId: string, userId: string): Promise<void> {
    return this.conversationRepository.resetUnreadCounter(conversationId, userId);
  }
}
