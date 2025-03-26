
// This file is deprecated. Use ChatService.ts instead.
// This file is maintained temporarily for backward compatibility.

/**
 * @fileoverview Servicio para gestionar mensajes y conversaciones
 * @module services/MessageService
 * @deprecated Use ChatService instead
 */

import { ChatService } from './ChatService';

/**
 * @deprecated Use ChatService instead
 */
export class MessageService {
  private static chatService = ChatService.getInstance();

  /**
   * @deprecated Use ChatService.getInstance() instead
   */
  public static getInstance(): MessageService {
    console.warn('MessageService is deprecated. Use ChatService instead.');
    return new MessageService();
  }

  /**
   * @deprecated Use ChatService.getUserConversations instead
   */
  async getUserConversations(userId: string) {
    return MessageService.chatService.getUserConversations(userId);
  }

  /**
   * @deprecated Use ChatService.getUnreadMessageCounts instead
   */
  async getUnreadMessageCounts(userId: string) {
    return MessageService.chatService.getUnreadMessageCounts(userId);
  }

  /**
   * @deprecated Use ChatService.getConversationMessages instead
   */
  async getConversationMessages(conversationId: string) {
    return MessageService.chatService.getConversationMessages(conversationId);
  }

  /**
   * @deprecated Use ChatService.getLatestMessages instead
   */
  async getLatestMessages(conversationId: string, limit: number = 10) {
    return MessageService.chatService.getLatestMessages(conversationId, limit);
  }

  /**
   * @deprecated Use ChatService.getNewMessagesSince instead
   */
  async getNewMessagesSince(conversationId: string, since: Date) {
    return MessageService.chatService.getNewMessagesSince(conversationId, since);
  }

  /**
   * @deprecated Use ChatService.sendMessage instead
   */
  async sendMessage(conversationId: string, senderId: string, senderType: 'user' | 'company', content: string) {
    return MessageService.chatService.sendMessage(conversationId, senderId, senderType, content);
  }

  /**
   * @deprecated Use ChatService.markMessagesAsRead instead
   */
  async markMessagesAsRead(conversationId: string, userId: string) {
    return MessageService.chatService.markMessagesAsRead(conversationId, userId);
  }

  /**
   * @deprecated Use ChatService.startConversation instead
   */
  async startConversation(productId: string, userId: string, companyId: string, initialMessage: string) {
    return MessageService.chatService.startConversation(productId, userId, companyId, initialMessage);
  }
}
