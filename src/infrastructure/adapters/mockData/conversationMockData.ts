
/**
 * @fileoverview Datos de ejemplo para conversaciones y mensajes
 * @module adapters/mockData/conversationMockData
 */

import { Conversation, Message } from '../../../core/domain/Message';

/**
 * Crea las conversaciones de ejemplo
 */
export function createMockConversations(): Conversation[] {
  // Ejemplo de conversaciones para el usuario
  const conversation1: Conversation = {
    id: 'conv-1',
    productId: '1',
    userId: 'user-1',
    companyId: 'company-1',
    lastMessageAt: new Date(Date.now() - 3600000), // Hace 1 hora
    productName: 'Taladro Profesional 20V',
    productImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    companyName: 'Pro Tools Inc.',
    userName: 'Juan Pérez',
    unreadCount: 2,
  };

  const conversation2: Conversation = {
    id: 'conv-2',
    productId: '2',
    userId: 'user-1',
    companyId: 'company-2',
    lastMessageAt: new Date(Date.now() - 86400000), // Hace 1 día
    productName: 'Sierra Circular 1500W',
    productImage: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    companyName: 'Herramientas Express',
    userName: 'Juan Pérez',
    unreadCount: 0,
  };

  return [conversation1, conversation2];
}

/**
 * Crea los mensajes de ejemplo
 */
export function createMockMessages(): Message[] {
  return [
    // Mensajes para la primera conversación
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: '¡Hola! Estoy interesado en alquilar este taladro. ¿Está disponible para este fin de semana?',
      timestamp: new Date(Date.now() - 14400000), // Hace 4 horas
      read: true,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: '¡Hola! Sí, el taladro está disponible este fin de semana. ¿Para qué días exactamente lo necesitas?',
      timestamp: new Date(Date.now() - 13800000), // Hace 3.8 horas
      read: true,
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Me gustaría alquilarlo desde el viernes por la tarde hasta el domingo por la noche.',
      timestamp: new Date(Date.now() - 13200000), // Hace 3.6 horas
      read: true,
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'Perfecto. Te puedo ofrecer una tarifa especial de fin de semana por 45€. ¿Te parece bien?',
      timestamp: new Date(Date.now() - 12600000), // Hace 3.5 horas
      read: true,
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'También incluiría una batería adicional sin cargo.',
      timestamp: new Date(Date.now() - 12500000), // Hace 3.47 horas
      read: true,
    },
    // Nuevos mensajes adicionales para la primera conversación
    {
      id: 'msg-10',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Suena genial. ¿La tarifa incluye el cargador y algún accesorio adicional?',
      timestamp: new Date(Date.now() - 11000000), // Hace 3.05 horas
      read: true,
    },
    {
      id: 'msg-11',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'Sí, incluye el cargador, dos baterías y un set de 10 brocas básicas. ¿Necesitas algún accesorio específico?',
      timestamp: new Date(Date.now() - 10500000), // Hace 2.9 horas
      read: true,
    },
    {
      id: 'msg-12',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Necesitaría una broca para hormigón. ¿Tienen disponible?',
      timestamp: new Date(Date.now() - 10000000), // Hace 2.77 horas
      read: true,
    },
    {
      id: 'msg-13',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'Sí, tenemos brocas para hormigón de varios tamaños. ¿Qué diámetro necesitas?',
      timestamp: new Date(Date.now() - 9500000), // Hace 2.63 horas
      read: true,
    },
    {
      id: 'msg-14',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Necesitaría una de 8mm y otra de 10mm si es posible.',
      timestamp: new Date(Date.now() - 8000000), // Hace 2.22 horas
      read: true,
    },
    {
      id: 'msg-15',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'Perfecto, puedo incluir ambas brocas por un extra de 5€ en total. ¿Te parece bien?',
      timestamp: new Date(Date.now() - 7500000), // Hace 2.08 horas
      read: true,
    },
    {
      id: 'msg-16',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Sí, me parece bien. Entonces serían 50€ en total por todo el fin de semana.',
      timestamp: new Date(Date.now() - 7000000), // Hace 1.94 horas
      read: true,
    },
    {
      id: 'msg-17',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'Exacto, 50€ en total. ¿Prefieres pagar por adelantado o al recoger el taladro?',
      timestamp: new Date(Date.now() - 6500000), // Hace 1.8 horas
      read: true,
    },
    {
      id: 'msg-18',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Prefiero pagar al recogerlo. ¿Cuál es la dirección de recogida?',
      timestamp: new Date(Date.now() - 6000000), // Hace 1.66 horas
      read: true,
    },
    {
      id: 'msg-19',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'Estamos en Calle Industria 23, Barcelona. Abrimos de 9:00 a 20:00. ¿A qué hora te vendría bien pasar el viernes?',
      timestamp: new Date(Date.now() - 1800000), // Hace 30 minutos
      read: false,
    },
    {
      id: 'msg-20',
      conversationId: 'conv-1',
      senderId: 'company-1',
      senderType: 'company',
      content: 'También necesitarás traer tu DNI y un depósito de 100€, que te devolveremos cuando regreses el equipo.',
      timestamp: new Date(Date.now() - 1700000), // Hace 28 minutos
      read: false,
    },

    // Mensajes para la segunda conversación
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Hola, ¿tienen esta sierra disponible para alquilar por una semana?',
      timestamp: new Date(Date.now() - 172800000), // Hace 2 días
      read: true,
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'company-2',
      senderType: 'company',
      content: 'Hola, sí está disponible. El precio semanal es de 85€.',
      timestamp: new Date(Date.now() - 158400000), // Hace 1.8 días
      read: true,
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderType: 'user',
      content: 'Genial. ¿Puedo recogerla el lunes próximo?',
      timestamp: new Date(Date.now() - 144000000), // Hace 1.67 días
      read: true,
    },
    {
      id: 'msg-9',
      conversationId: 'conv-2',
      senderId: 'company-2',
      senderType: 'company',
      content: 'Sí, estamos abiertos de 9:00 a 18:00. Trae tu identificación y un depósito de 100€.',
      timestamp: new Date(Date.now() - 86400000), // Hace 1 día
      read: true,
    },
  ];
}

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
