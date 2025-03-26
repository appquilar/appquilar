
/**
 * @fileoverview Servicio para operaciones relacionadas con conversaciones
 * @module adapters/services/ConversationService
 */

import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '../../../core/domain/Message';
import { mapDbToConversation } from '../mappers/messageMappers';

/**
 * Servicio para operaciones relacionadas con conversaciones
 */
export class ConversationService {
  /**
   * Obtiene las conversaciones de un usuario
   * @param userId ID del usuario
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
    
    return data.map(conv => mapDbToConversation(conv));
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
   * Crea una nueva conversación
   * @param productId ID del producto
   * @param userId ID del usuario
   * @param companyId ID de la empresa
   */
  async createConversation(
    productId: string,
    userId: string,
    companyId: string
  ): Promise<Conversation> {
    // Obtener información del producto y la empresa
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
    
    return mapDbToConversation(conversationData);
  }

  /**
   * Actualiza los datos de la conversación al enviar un nuevo mensaje
   * @param conversationId ID de la conversación
   * @param isCompanyMessage Indica si el mensaje es de la empresa
   */
  async updateConversationOnNewMessage(
    conversationId: string, 
    isCompanyMessage: boolean
  ): Promise<void> {
    const updates: Record<string, any> = {
      last_message_at: new Date().toISOString(),
    };
    
    // Si es un mensaje de la empresa, incrementar contador de no leídos
    if (isCompanyMessage) {
      try {
        // Intentar usar la función RPC para incrementar el contador
        const { error: rpcError } = await supabase
          .rpc('increment_unread', { conversation_id: conversationId });
        
        if (rpcError) {
          console.error('Error al incrementar contador de no leídos:', rpcError);
          // Si falla la RPC, actualizar directamente con una expresión numérica
          const { data: currentData, error: fetchError } = await supabase
            .from('conversations')
            .select('unread_count')
            .eq('id', conversationId)
            .single();
            
          if (!fetchError && currentData) {
            updates.unread_count = (currentData.unread_count || 0) + 1;
          } else {
            updates.unread_count = 1; // Valor predeterminado si no se puede obtener el actual
          }
        }
      } catch (error) {
        console.error('Error al llamar a RPC increment_unread:', error);
        updates.unread_count = 1; // Valor predeterminado en caso de error
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

  /**
   * Resetea el contador de mensajes no leídos
   * @param conversationId ID de la conversación
   * @param userId ID del usuario
   */
  async resetUnreadCounter(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error al actualizar contador de no leídos:', error);
      throw error;
    }
  }
}
