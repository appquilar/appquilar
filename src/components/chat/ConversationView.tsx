
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
import { useIsMobile } from '@/hooks/use-mobile';
import RentalFormModal from './RentalFormModal';

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
}

// Número de mensajes a cargar inicialmente
const INITIAL_MESSAGE_LIMIT = 10;
// Intervalo de actualización de mensajes en milisegundos
const MESSAGE_POLLING_INTERVAL = 5000; 

/**
 * Vista de conversación individual
 */
const ConversationView = ({ conversation, onBack }: ConversationViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const { user } = useAuth();
  const messageService = MessageService.getInstance();
  const lastCheckedRef = useRef<Date>(new Date());
  const isMobile = useIsMobile();
  
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
  
  // Polling para simular tiempo real con mocks
  useEffect(() => {
    if (!conversation.id || !user) return;
    
    // Función para verificar nuevos mensajes periódicamente
    const checkNewMessages = async () => {
      try {
        // Obtener mensajes nuevos desde la última consulta
        const newMessages = await messageService.getNewMessagesSince(
          conversation.id,
          lastCheckedRef.current
        );
        
        if (newMessages.length > 0) {
          setMessages(prevMessages => [...prevMessages, ...newMessages]);
          
          // Marcar como leídos si son mensajes entrantes
          await messageService.markMessagesAsRead(conversation.id, user.id);
        }
        
        // Actualizar el tiempo de referencia
        lastCheckedRef.current = new Date();
      } catch (error) {
        console.error('Error al verificar nuevos mensajes:', error);
      }
    };
    
    // Configurar polling para simular actualizaciones en tiempo real
    const intervalId = setInterval(checkNewMessages, MESSAGE_POLLING_INTERVAL);
    
    return () => {
      clearInterval(intervalId);
    };
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

  const handleOpenRentalModal = () => {
    setRentalModalOpen(true);
  };
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
        onCreateRental={handleOpenRentalModal}
      />
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} userId={user?.id} />
      </div>
      <MessageForm onSendMessage={handleSendMessage} isSending={isSending} />

      {/* Mobile-only bottom button for adding rental */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-20 px-4 pb-2 bg-gradient-to-t from-background to-transparent">
          <Button 
            onClick={handleOpenRentalModal}
            className="w-full shadow-md gap-2" 
            size="lg"
          >
            <PlusCircle className="h-5 w-5" />
            Añadir Alquiler
          </Button>
        </div>
      )}

      {/* Rental Form Modal */}
      <RentalFormModal 
        isOpen={rentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
        conversation={conversation}
      />
    </div>
  );
};

export default ConversationView;
