
/**
 * @fileoverview Servicio para manipular los datos mock de conversaciones
 * @module adapters/mockData/conversationDataService
 */

import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../../../core/domain/Message';
import { createMockConversations, createMockMessages, createNewConversation } from './conversationMockData';

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
   * Obtiene los mensajes de una conversación
   */
  getConversationMessages(conversationId: string): Message[] {
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
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
