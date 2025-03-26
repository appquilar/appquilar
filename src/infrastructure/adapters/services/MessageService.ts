
/**
 * @fileoverview Servicio para operaciones relacionadas con mensajes
 * @module adapters/services/MessageService
 */

import { supabase } from '@/integrations/supabase/client';
import { Message } from '../../../core/domain/Message';
import { mapDbToMessage, mapMessageToDb } from '../mappers/messageMappers';

/**
 * Servicio para operaciones relacionadas con mensajes
 */
export class MessageService {
  /**
   * Obtiene los mensajes de una conversación
   * @param conversationId ID de la conversación
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
    
    return data.map(msg => mapDbToMessage(msg));
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
      .map(msg => mapDbToMessage(msg))
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
    
    return data.map(msg => mapDbToMessage(msg));
  }

  /**
   * Crea un nuevo mensaje
   * @param messageData Datos del mensaje a crear
   */
  async createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const dbMessage = mapMessageToDb(messageData);
    
    // Fix: El insert espera un objeto, no un array ni un Record<string, any>
    const { data, error } = await supabase
      .from('messages')
      .insert(dbMessage)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error al crear mensaje:', error);
      throw error;
    }
    
    return mapDbToMessage(data);
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
  }
}
