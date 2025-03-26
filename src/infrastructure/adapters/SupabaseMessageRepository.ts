
/**
 * @fileoverview Implementación de Supabase del repositorio de mensajes
 * @module adapters/SupabaseMessageRepository
 */

import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '../../core/domain/Message';
import { MessageRepository } from '../../core/ports/MessageRepository';
import { mapDbToConversation, mapDbToMessage } from './mappers/messageMappers';
import { ConversationService } from './services/ConversationService';
import { MessageService } from './services/MessageService';

/**
 * Implementación Supabase del repositorio de mensajes
 */
export class SupabaseMessageRepository implements MessageRepository {
  private conversationService: ConversationService;
  private messageService: MessageService;

  constructor() {
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
  }

  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de conversaciones
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationService.getUserConversations(userId);
  }

  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    return this.conversationService.getUnreadMessageCounts(userId);
  }

  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   * @returns Lista de mensajes
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageService.getConversationMessages(conversationId);
  }

  /**
   * Obtiene los mensajes más recientes de una conversación
   * @param conversationId ID de la conversación
   * @param limit Número máximo de mensajes a obtener
   */
  async getLatestMessages(conversationId: string, limit: number): Promise<Message[]> {
    return this.messageService.getLatestMessages(conversationId, limit);
  }

  /**
   * Obtiene los mensajes nuevos desde una fecha determinada
   * @param conversationId ID de la conversación
   * @param since Fecha desde la que obtener mensajes nuevos
   */
  async getNewMessagesSince(conversationId: string, since: Date): Promise<Message[]> {
    return this.messageService.getNewMessagesSince(conversationId, since);
  }

  /**
   * Crea un nuevo mensaje
   * @param messageData Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const message = await this.messageService.createMessage(messageData);
    
    // Actualizar el contador de mensajes no leídos y la fecha del último mensaje en la conversación
    await this.conversationService.updateConversationOnNewMessage(
      messageData.conversationId, 
      messageData.senderType === 'company'
    );
    
    return message;
  }

  /**
   * Marca los mensajes como leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario que marca como leídos
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageService.markMessagesAsRead(conversationId, userId);
    await this.conversationService.resetUnreadCounter(conversationId, userId);
  }

  /**
   * Inicia una nueva conversación
   * @param productId ID del producto
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   * @param initialMessage Mensaje inicial
   * @returns Conversación creada
   */
  async startConversation(
    productId: string,
    userId: string,
    companyId: string,
    initialMessage: string
  ): Promise<Conversation> {
    // Crear la conversación
    const conversation = await this.conversationService.createConversation(
      productId,
      userId,
      companyId
    );
    
    // Crear el mensaje inicial
    await this.createMessage({
      conversationId: conversation.id,
      senderId: userId,
      senderType: 'user',
      content: initialMessage,
      read: false
    });
    
    return conversation;
  }
}
