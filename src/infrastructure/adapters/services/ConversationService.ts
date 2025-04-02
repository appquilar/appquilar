
/**
 * @fileoverview Servicio para operaciones relacionadas con conversaciones
 * @module adapters/services/ConversationService
 */

import { Conversation } from '../../../core/domain/Message';
import { ConversationService as AppConversationService } from '../../../core/application/ConversationService';
import { MockMessageRepository } from '../MockMessageRepository';

/**
 * Servicio para operaciones relacionadas con conversaciones
 * Adaptador que utiliza el servicio de aplicación y el repositorio Mock para desarrollo
 */
export class ConversationService {
  private appService: AppConversationService;
  
  constructor() {
    // Inyectar la implementación Mock del repositorio para desarrollo
    const repository = new MockMessageRepository();
    this.appService = new AppConversationService(repository);
  }

  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.appService.getUserConversations(userId);
  }

  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    return this.appService.getUnreadMessageCounts(userId);
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
    return this.appService.createConversation(productId, userId, companyId);
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
    return this.appService.updateConversationOnNewMessage(conversationId, isCompanyMessage);
  }

  /**
   * Resetea el contador de mensajes no leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario
   */
  async resetUnreadCounter(conversationId: string, userId: string): Promise<void> {
    return this.appService.resetUnreadCounter(conversationId, userId);
  }
}
