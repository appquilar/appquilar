
/**
 * @fileoverview Implementación mock del repositorio de mensajes
 * @module adapters/MockMessageRepository
 */

import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../../core/domain/Message';
import { MessageRepository } from '../../core/ports/MessageRepository';

/**
 * Implementación mock del repositorio de mensajes para desarrollo
 */
export class MockMessageRepository implements MessageRepository {
  private conversations: Conversation[] = [];
  private messages: Message[] = [];

  constructor() {
    // Inicializar algunos datos de ejemplo
    this.initializeMockData();
  }

  /**
   * Inicializa datos mock para desarrollo
   */
  private initializeMockData(): void {
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
      unreadCount: 0,
    };

    this.conversations = [conversation1, conversation2];

    // Mensajes para la primera conversación
    this.messages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderType: 'user',
        content: '¡Hola! Estoy interesado en alquilar este taladro. ¿Está disponible para este fin de semana?',
        timestamp: new Date(Date.now() - 7200000), // Hace 2 horas
        read: true,
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'company-1',
        senderType: 'company',
        content: '¡Hola! Sí, el taladro está disponible este fin de semana. ¿Para qué días exactamente lo necesitas?',
        timestamp: new Date(Date.now() - 5400000), // Hace 1.5 horas
        read: true,
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'user-1',
        senderType: 'user',
        content: 'Me gustaría alquilarlo desde el viernes por la tarde hasta el domingo por la noche.',
        timestamp: new Date(Date.now() - 3600000), // Hace 1 hora
        read: true,
      },
      {
        id: 'msg-4',
        conversationId: 'conv-1',
        senderId: 'company-1',
        senderType: 'company',
        content: 'Perfecto. Te puedo ofrecer una tarifa especial de fin de semana por 45€. ¿Te parece bien?',
        timestamp: new Date(Date.now() - 1800000), // Hace 30 minutos
        read: false,
      },
      {
        id: 'msg-5',
        conversationId: 'conv-1',
        senderId: 'company-1',
        senderType: 'company',
        content: 'También incluiría una batería adicional sin cargo.',
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
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de conversaciones
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.conversations.filter(conv => conv.userId === userId);
  }

  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   * @returns Lista de mensajes
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Crea un nuevo mensaje
   * @param messageData Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
   * @param conversationId ID de la conversación
   * @param userId ID del usuario que marca como leídos
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 150));
    
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
    const newConversation: Conversation = {
      id: uuidv4(),
      productId,
      userId,
      companyId,
      lastMessageAt: new Date(),
      productName: 'Taladro Profesional 20V', // Esto normalmente vendría de una consulta a productos
      productImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      companyName: 'Pro Tools Inc.', // Esto normalmente vendría de una consulta a empresas
      unreadCount: 0,
    };
    
    this.conversations.push(newConversation);
    
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
