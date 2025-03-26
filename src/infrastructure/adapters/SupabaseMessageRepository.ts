
/**
 * @fileoverview Implementación de Supabase del repositorio de mensajes
 * @module adapters/SupabaseMessageRepository
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '../../core/domain/Message';
import { MessageRepository } from '../../core/ports/MessageRepository';

/**
 * Implementación Supabase del repositorio de mensajes
 */
export class SupabaseMessageRepository implements MessageRepository {
  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de conversaciones
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });
    
    if (error) {
      console.error('Error al obtener conversaciones:', error);
      throw error;
    }
    
    return data.map(conv => ({
      id: conv.id,
      productId: conv.product_id,
      userId: conv.user_id,
      companyId: conv.company_id,
      lastMessageAt: new Date(conv.last_message_at),
      productName: conv.product_name,
      productImage: conv.product_image,
      companyName: conv.company_name,
      userName: conv.user_name,
      unreadCount: conv.unread_count
    }));
  }

  /**
   * Obtiene solo los contadores de mensajes no leídos para todas las conversaciones de un usuario
   * @param userId ID del usuario
   */
  async getUnreadMessageCounts(userId: string): Promise<Array<{conversationId: string, unreadCount: number}>> {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, unread_count')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al obtener contadores de mensajes no leídos:', error);
      throw error;
    }
    
    return data.map(item => ({
      conversationId: item.id,
      unreadCount: item.unread_count
    }));
  }

  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
   * @returns Lista de mensajes
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error al obtener mensajes de la conversación:', error);
      throw error;
    }
    
    return data.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderType: msg.sender_type as 'user' | 'company',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      read: msg.read
    }));
  }

  /**
   * Obtiene los mensajes más recientes de una conversación
   * @param conversationId ID de la conversación
   * @param limit Número máximo de mensajes a obtener
   */
  async getLatestMessages(conversationId: string, limit: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error al obtener mensajes recientes:', error);
      throw error;
    }
    
    return data
      .map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderType: msg.sender_type as 'user' | 'company',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        read: msg.read
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Reordenar cronológicamente
  }

  /**
   * Obtiene los mensajes nuevos desde una fecha determinada
   * @param conversationId ID de la conversación
   * @param since Fecha desde la que obtener mensajes nuevos
   */
  async getNewMessagesSince(conversationId: string, since: Date): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .gt('timestamp', since.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error al obtener mensajes nuevos:', error);
      throw error;
    }
    
    return data.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderType: msg.sender_type as 'user' | 'company',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      read: msg.read
    }));
  }

  /**
   * Crea un nuevo mensaje
   * @param messageData Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: messageData.conversationId,
        sender_id: messageData.senderId,
        sender_type: messageData.senderType,
        content: messageData.content,
        read: messageData.read
      }])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error al crear mensaje:', error);
      throw error;
    }
    
    // Actualizar el contador de mensajes no leídos y la fecha del último mensaje en la conversación
    await this.updateConversationOnNewMessage(
      messageData.conversationId, 
      messageData.senderType === 'company'
    );
    
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      senderType: data.sender_type as 'user' | 'company',
      content: data.content,
      timestamp: new Date(data.timestamp),
      read: data.read
    };
  }

  /**
   * Marca los mensajes como leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario que marca como leídos
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Marcar mensajes como leídos
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
    
    if (updateError) {
      console.error('Error al marcar mensajes como leídos:', updateError);
      throw updateError;
    }
    
    // Actualizar contador de no leídos en la conversación
    const { error: convError } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (convError) {
      console.error('Error al actualizar contador de no leídos:', convError);
      throw convError;
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
    // Primero, obtener información del producto y la empresa
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('name, image_url, companies(name)')
      .eq('id', productId)
      .eq('company_id', companyId)
      .single();
    
    if (productError) {
      console.error('Error al obtener información del producto:', productError);
      throw productError;
    }
    
    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error al obtener información del usuario:', userError);
      throw userError;
    }
    
    const userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Usuario';
    
    // Crear la conversación
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .insert([{
        product_id: productId,
        user_id: userId,
        company_id: companyId,
        product_name: productData.name,
        product_image: productData.image_url,
        company_name: productData.companies?.name || 'Empresa',
        user_name: userName,
        unread_count: 0
      }])
      .select('*')
      .single();
    
    if (convError) {
      console.error('Error al crear conversación:', convError);
      throw convError;
    }
    
    // Crear el mensaje inicial
    await this.createMessage({
      conversationId: conversationData.id,
      senderId: userId,
      senderType: 'user',
      content: initialMessage,
      read: false
    });
    
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
   * Actualiza los datos de la conversación al enviar un nuevo mensaje
   * @private
   */
  private async updateConversationOnNewMessage(
    conversationId: string, 
    isCompanyMessage: boolean
  ): Promise<void> {
    const updates: Record<string, any> = {
      last_message_at: new Date().toISOString(),
    };
    
    // Si es un mensaje de la empresa, incrementar contador de no leídos
    if (isCompanyMessage) {
      try {
        const { error: rpcError } = await supabase.rpc('increment_unread', { 
          conversation_id: conversationId 
        });
        
        if (rpcError) {
          console.error('Error al incrementar contador de no leídos:', rpcError);
          // Si falla la RPC, actualizar directamente con una expresión SQL
          updates.unread_count = updates.unread_count || 0;
          updates.unread_count += 1;
        }
      } catch (error) {
        console.error('Error al llamar a RPC increment_unread:', error);
        updates.unread_count = updates.unread_count || 0;
        updates.unread_count += 1;
      }
    }
    
    const { error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId);
    
    if (error) {
      console.error('Error al actualizar conversación:', error);
      throw error;
    }
  }
}
