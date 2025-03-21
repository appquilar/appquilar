
/**
 * @fileoverview Componente para visualizar una conversación
 * @module components/chat/ConversationView
 */

import { useState, useEffect } from 'react';
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

/**
 * Vista de conversación individual
 */
const ConversationView = ({ conversation, onBack }: ConversationViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const messageService = MessageService.getInstance();
  
  // Cargar mensajes al inicializar
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const conversationMessages = await messageService.getConversationMessages(conversation.id);
        setMessages(conversationMessages);
        
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
    
    loadMessages();
    
    // Configurar un intervalo para actualizar periódicamente
    const intervalId = setInterval(loadMessages, 10000);
    
    return () => clearInterval(intervalId);
  }, [conversation.id, user]);
  
  // Manejar el envío de un nuevo mensaje
  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    try {
      setIsSending(true);
      
      await messageService.sendMessage(
        conversation.id,
        user.id,
        'user',
        content
      );
      
      // Recargar mensajes
      const updatedMessages = await messageService.getConversationMessages(conversation.id);
      setMessages(updatedMessages);
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
