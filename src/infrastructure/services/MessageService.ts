
/**
 * @fileoverview Servicio para gestionar mensajes y conversaciones
 * @module services/MessageService
 */

import { Conversation, Message } from "../../core/domain/Message";
import { MessageRepository } from "../../core/ports/MessageRepository";
import { MockMessageRepository } from "../adapters/MockMessageRepository";

/**
 * Servicio para la gestión de mensajes en la aplicación
 */
export class MessageService {
  private messageRepository: MessageRepository;
  private static instance: MessageService;

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    // En producción, esto sería inyectado o configurado según el entorno
    this.messageRepository = new MockMessageRepository();
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
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
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   * @returns Lista de mensajes
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.getConversationMessages(conversationId);
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
