
/**
 * @fileoverview Puerto para el repositorio de mensajes
 * @module ports/MessageRepository
 */

import { Conversation, Message } from "../domain/Message";

/**
 * Puerto de repositorio para la gestión de mensajes
 */
export interface MessageRepository {
  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   */
  getUserConversations(userId: string): Promise<Conversation[]>;
  
  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   */
  getConversationMessages(conversationId: string): Promise<Message[]>;
  
  /**
   * Crea un nuevo mensaje
   * @param message Mensaje a crear
   */
  createMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message>;
  
  /**
   * Marca los mensajes como leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario que marca como leídos
   */
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  
  /**
   * Inicia una nueva conversación
   * @param productId ID del producto
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   * @param initialMessage Mensaje inicial
   */
  startConversation(
    productId: string, 
    userId: string, 
    companyId: string, 
    initialMessage: string
  ): Promise<Conversation>;
}
