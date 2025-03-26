
/**
 * @fileoverview Mappers para transformar datos de mensajes entre dominio y persistencia
 * @module adapters/mappers/messageMappers
 */

import { Conversation, Message } from '../../../core/domain/Message';

/**
 * Mapea una conversación de la base de datos al dominio
 * @param conversationData Datos de la conversación desde la base de datos
 */
export function mapDbToConversation(conversationData: any): Conversation {
  return {
    id: conversationData.id,
    productId: conversationData.product_id,
    userId: conversationData.user_id,
    companyId: conversationData.company_id,
    lastMessageAt: new Date(conversationData.last_message_at),
    productName: conversationData.product_name,
    productImage: conversationData.product_image,
    companyName: conversationData.company_name,
    userName: conversationData.user_name,
    unreadCount: conversationData.unread_count
  };
}

/**
 * Mapea un mensaje de la base de datos al dominio
 * @param messageData Datos del mensaje desde la base de datos
 */
export function mapDbToMessage(messageData: any): Message {
  return {
    id: messageData.id,
    conversationId: messageData.conversation_id,
    senderId: messageData.sender_id,
    senderType: messageData.sender_type as 'user' | 'company',
    content: messageData.content,
    timestamp: new Date(messageData.timestamp),
    read: messageData.read
  };
}

/**
 * Mapea un mensaje del dominio a la base de datos
 * @param message Mensaje del dominio
 */
export function mapMessageToDb(message: Omit<Message, 'id' | 'timestamp'>): Record<string, any> {
  return {
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    sender_type: message.senderType,
    content: message.content,
    read: message.read
  };
}
