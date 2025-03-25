
/**
 * @fileoverview Servicio para gestionar mensajes y conversaciones
 * @module services/MessageService
 */

import { Conversation, Message } from "../../core/domain/Message";
import { MessageRepository } from "../../core/ports/MessageRepository";
import { MockMessageRepository } from "../adapters/MockMessageRepository";
import { SupabaseMessageRepository } from "../adapters/SupabaseMessageRepository";
import { supabase } from "@/integrations/supabase/client";

/**
 * Servicio para la gestión de mensajes en la aplicación
 */
export class MessageService {
  private messageRepository: MessageRepository;
  private static instance: MessageService;
  private useSupabase: boolean;

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    // Determinar si usar Supabase o datos mock basado en la disponibilidad de auth
    this.useSupabase = !!supabase;
    this.messageRepository = this.useSupabase 
      ? new SupabaseMessageRepository() 
      : new MockMessageRepository();
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
