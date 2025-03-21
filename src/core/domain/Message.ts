
/**
 * @fileoverview Representa la entidad de mensaje en el dominio de la aplicación
 * @module domain/Message
 */

/**
 * Entidad de dominio que representa un mensaje en una conversación
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'company';
  content: string;
  timestamp: Date;
  read: boolean;
}

/**
 * Entidad de dominio que representa una conversación
 */
export interface Conversation {
  id: string;
  productId: string;
  userId: string;
  companyId: string;
  lastMessageAt: Date;
  productName: string;
  productImage: string;
  companyName: string;
  userName: string;
  unreadCount: number;
}

/**
 * Validador de entidad Message
 */
export function validateMessage(message: Message): boolean {
  return Boolean(
    message.conversationId && 
    message.senderId && 
    message.content
  );
}
