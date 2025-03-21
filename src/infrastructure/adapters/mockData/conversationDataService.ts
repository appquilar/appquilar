
/**
 * @fileoverview Servicio para manipular los datos mock de conversaciones
 * @module adapters/mockData/conversationDataService
 */

import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../../../core/domain/Message';
import { 
  createMockConversations, 
  createMockMessages, 
  createNewConversation 
} from './conversations';

/**
 * Servicio que gestiona los datos mock de las conversaciones
 */
export class ConversationDataService {
  private conversations: Conversation[];
  private messages: Message[];

  constructor() {
    this.conversations = createMockConversations();
    this.messages = createMockMessages();
  }

  /**
   * Obtiene todas las conversaciones
   */
  getConversations(): Conversation[] {
    return [...this.conversations];
  }

  /**
   * Obtiene las conversaciones de un usuario
   */
  getUserConversations(userId: string): Conversation[] {
    return this.conversations.filter(conv => conv.userId === userId);
  }

  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   */
  getUnreadMessageCounts(userId: string): Array<{conversationId: string, unreadCount: number}> {
    return this.conversations
      .filter(conv => conv.userId === userId)
      .map(conv => ({
        conversationId: conv.id,
        unreadCount: conv.unreadCount
      }));
  }

  /**
   * Obtiene los mensajes de una conversación
   */
  getConversationMessages(conversationId: string): Message[] {
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Obtiene los mensajes más recientes de una conversación
   */
  getLatestMessages(conversationId: string, limit: number): Message[] {
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Ordenar del más reciente al más antiguo
      .slice(0, limit) // Limitar la cantidad de mensajes
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Volver a ordenar cronológicamente
  }

  /**
   * Obtiene los mensajes nuevos desde una fecha determinada
   */
  getNewMessagesSince(conversationId: string, since: Date): Message[] {
    return this.messages
      .filter(msg => 
        msg.conversationId === conversationId && 
        msg.timestamp.getTime() > since.getTime()
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Crea un nuevo mensaje
   */
  createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...messageData,
      id: uuidv4(),
      timestamp: new Date(),
    };
    
    this.messages.push(newMessage);
    
    // Actualizar la conversación
    const conversationIndex = this.conversations.findIndex(
      conv => conv.id === messageData.conversationId
    );
    
    if (conversationIndex !== -1) {
      this.conversations[conversationIndex] = {
        ...this.conversations[conversationIndex],
        lastMessageAt: newMessage.timestamp,
        unreadCount: messageData.senderType === 'company' 
          ? this.conversations[conversationIndex].unreadCount + 1 
          : this.conversations[conversationIndex].unreadCount
      };
    }
    
    return newMessage;
  }

  /**
   * Marca los mensajes como leídos
   */
  markMessagesAsRead(conversationId: string, userId: string): void {
    // Marcar los mensajes como leídos
    this.messages = this.messages.map(msg => {
      if (msg.conversationId === conversationId && msg.senderId !== userId) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    // Actualizar el contador de no leídos
    const conversationIndex = this.conversations.findIndex(
      conv => conv.id === conversationId
    );
    
    if (conversationIndex !== -1) {
      this.conversations[conversationIndex] = {
        ...this.conversations[conversationIndex],
        unreadCount: 0
      };
    }
  }

  /**
   * Inicia una nueva conversación
   */
  startConversation(
    productId: string, 
    userId: string, 
    companyId: string
  ): Conversation {
    // Crear la conversación
    const newConversation = createNewConversation(productId, userId, companyId);
    
    this.conversations.push(newConversation);
    
    return newConversation;
  }
}

// Singleton instance
export const conversationDataService = new ConversationDataService();
