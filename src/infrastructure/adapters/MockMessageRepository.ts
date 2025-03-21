
/**
 * @fileoverview Implementación mock del repositorio de mensajes
 * @module adapters/MockMessageRepository
 */

import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../../core/domain/Message';
import { MessageRepository } from '../../core/ports/MessageRepository';
import { conversationDataService } from './mockData/conversationDataService';

/**
 * Implementación mock del repositorio de mensajes para desarrollo
 */
export class MockMessageRepository implements MessageRepository {
  private dataService = conversationDataService;

  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de conversaciones
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.dataService.getUserConversations(userId);
  }

  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   * @returns Lista de mensajes
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.dataService.getConversationMessages(conversationId);
  }

  /**
   * Crea un nuevo mensaje
   * @param messageData Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.dataService.createMessage(messageData);
  }

  /**
   * Marca los mensajes como leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario que marca como leídos
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 150));
    this.dataService.markMessagesAsRead(conversationId, userId);
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
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Crear la conversación
    const newConversation = this.dataService.startConversation(
      productId,
      userId, 
      companyId
    );
    
    // Crear el mensaje inicial
    await this.createMessage({
      conversationId: newConversation.id,
      senderId: userId,
      senderType: 'user',
      content: initialMessage,
      read: false,
    });
    
    return newConversation;
  }
}
