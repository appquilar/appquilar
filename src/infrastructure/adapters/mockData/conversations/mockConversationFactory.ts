
/**
 * @fileoverview Fábrica para crear nuevas conversaciones de prueba
 * @module adapters/mockData/conversations/mockConversationFactory
 */

import { Conversation } from '../../../../core/domain/Message';

/**
 * Crea datos mock para una nueva conversación
 */
export function createNewConversation(
  productId: string,
  userId: string,
  companyId: string
): Conversation {
  return {
    id: `conv-${Date.now()}`,
    productId,
    userId,
    companyId,
    lastMessageAt: new Date(),
    productName: 'Taladro Profesional 20V', // Esto normalmente vendría de una consulta a productos
    productImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    companyName: 'Pro Tools Inc.', // Esto normalmente vendría de una consulta a empresas
    userName: 'Juan Pérez', // En una implementación real, obtendríamos el nombre del usuario
    unreadCount: 0,
  };
}
