
/**
 * @fileoverview Servicio para gestionar mensajes y conversaciones
 * @module services/ChatService
 */

import { Conversation, Message } from "../../core/domain/Message";
import { MessageRepository } from "../../core/ports/MessageRepository";
import { MockMessageRepository } from "../adapters/MockMessageRepository";

/**
 * Servicio para la gestión de mensajes en la aplicación
 */
export class ChatService {
  private messageRepository: MessageRepository;
  private static instance: ChatService;
  private useSupabase: boolean;

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    // Forzar el uso de datos mock
    this.useSupabase = false;
    this.messageRepository = new MockMessageRepository();
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Cambia entre el uso de datos reales y datos mock
   * @param useSupabase Indica si se deben usar datos de Supabase (ignorado en esta implementación)
   */
  public setUseSupabase(useSupabase: boolean): void {
    // En esta implementación siempre usamos datos mock
    console.log('Usando repositorio mock para mensajes');
    this.useSupabase = false;
    this.messageRepository = new MockMessageRepository();
  }

  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de conversaciones
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.messageRepository.getUserConversations(userId);
  }

  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   * @returns Array de objetos con el ID de la conversación y el número de mensajes no leídos
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    return this.messageRepository.getUnreadMessageCounts(userId);
  }

  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   * @returns Lista de mensajes
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.getConversationMessages(conversationId);
  }

  /**
   * Obtiene los mensajes más recientes de una conversación
   * @param conversationId ID de la conversación
   * @param limit Número máximo de mensajes a obtener
   * @returns Lista de mensajes más recientes
   */
  async getLatestMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    return this.messageRepository.getLatestMessages(conversationId, limit);
  }

  /**
   * Obtiene los mensajes nuevos desde una fecha determinada
   * @param conversationId ID de la conversación
   * @param since Fecha desde la que obtener mensajes nuevos
   * @returns Lista de mensajes nuevos
   */
  async getNewMessagesSince(conversationId: string, since: Date): Promise<Message[]> {
    return this.messageRepository.getNewMessagesSince(conversationId, since);
  }

  /**
   * Envía un nuevo mensaje
   * @param conversationId ID de la conversación
   * @param senderId ID del remitente
   * @param senderType Tipo de remitente (usuario o empresa)
   * @param content Contenido del mensaje
   * @returns Mensaje creado
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'user' | 'company',
    content: string
  ): Promise<Message> {
    return this.messageRepository.createMessage({
      conversationId,
      senderId,
      senderType,
      content,
      read: false
    });
  }

  /**
   * Marca los mensajes como leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario que marca como leídos
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    return this.messageRepository.markMessagesAsRead(conversationId, userId);
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
    return this.messageRepository.startConversation(
      productId,
      userId,
      companyId,
      initialMessage
    );
  }
}
