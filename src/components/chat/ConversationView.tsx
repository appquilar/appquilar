
/**
 * @fileoverview Componente para visualizar una conversación
 * @module components/chat/ConversationView
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Conversation, Message } from '@/core/domain/Message';
import { MessageService } from '@/infrastructure/services/MessageService';
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageForm from './MessageForm';

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
}

// Número de mensajes a cargar inicialmente
const INITIAL_MESSAGE_LIMIT = 10;

/**
 * Vista de conversación individual
 */
const ConversationView = ({ conversation, onBack }: ConversationViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const messageService = MessageService.getInstance();
  const lastCheckedRef = useRef<Date>(new Date());
  
  // Cargar mensajes iniciales al abrir la conversación
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!conversation.id) return;
      
      try {
        setIsLoading(true);
        
        // Cargar solo los últimos mensajes en lugar de toda la conversación
        const latestMessages = await messageService.getLatestMessages(
          conversation.id, 
          INITIAL_MESSAGE_LIMIT
        );
        
        setMessages(latestMessages);
        
        // Actualizar la referencia de tiempo para futuras consultas
        lastCheckedRef.current = new Date();
        
        // Marcar mensajes como leídos
        if (user) {
          await messageService.markMessagesAsRead(conversation.id, user.id);
        }
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialMessages();
  }, [conversation.id, user]);
  
  // Actualizar solo los mensajes nuevos periódicamente
  useEffect(() => {
    if (!conversation.id) return;
    
    const checkForNewMessages = async () => {
      try {
        // Obtener solo los mensajes nuevos desde la última vez
        const newMessages = await messageService.getNewMessagesSince(
          conversation.id,
          lastCheckedRef.current
        );
        
        // Si hay mensajes nuevos, añadirlos a la lista
        if (newMessages.length > 0) {
          setMessages(prevMessages => [...prevMessages, ...newMessages]);
          
          // Marcar como leídos si son mensajes entrantes
          if (user) {
            await messageService.markMessagesAsRead(conversation.id, user.id);
          }
        }
        
        // Actualizar el tiempo de referencia
        lastCheckedRef.current = new Date();
      } catch (error) {
        console.error('Error al verificar nuevos mensajes:', error);
      }
    };
    
    // Verificar mensajes nuevos cada 5 segundos
    const intervalId = setInterval(checkForNewMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [conversation.id, user]);
  
  // Manejar el envío de un nuevo mensaje
  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    try {
      setIsSending(true);
      
      const newMessage = await messageService.sendMessage(
        conversation.id,
        user.id,
        'user',
        content
      );
      
      // Añadir el nuevo mensaje al estado directamente
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Actualizar el tiempo de referencia
      lastCheckedRef.current = new Date();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
      throw error;
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversation={conversation} onBack={onBack} />
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} userId={user?.id} />
      </div>
      <MessageForm onSendMessage={handleSendMessage} isSending={isSending} />
    </div>
  );
};

export default ConversationView;
