
/**
 * @fileoverview Componente para visualizar una conversación
 * @module components/chat/ConversationView
 */

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Conversation, Message } from '@/core/domain/Message';
import { MessageService } from '@/infrastructure/services/MessageService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
}

/**
 * Vista de conversación individual
 */
const ConversationView = ({ conversation, onBack }: ConversationViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const messageService = MessageService.getInstance();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Desplazar automáticamente al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Manejar el envío de un nuevo mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    try {
      setIsSending(true);
      
      await messageService.sendMessage(
        conversation.id,
        user.id,
        'user',
        newMessage.trim()
      );
      
      // Recargar mensajes
      const updatedMessages = await messageService.getConversationMessages(conversation.id);
      setMessages(updatedMessages);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Encabezado */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft size={18} />
        </Button>
        
        <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden border border-border">
          <img 
            src={conversation.productImage} 
            alt={conversation.productName}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div>
          <h3 className="font-medium text-sm">{conversation.productName}</h3>
          <p className="text-xs text-muted-foreground">{conversation.companyName}</p>
        </div>
      </div>
      
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <p className="text-muted-foreground">No hay mensajes en esta conversación.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isUserMessage = message.senderType === 'user';
            const formattedTime = format(message.timestamp, 'HH:mm - d MMM', { locale: es });
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isUserMessage 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-secondary text-secondary-foreground rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isUserMessage ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'}`}>
                    {formattedTime}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Formulario de envío */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            placeholder="Escribe tu mensaje..."
            className="min-h-[60px] max-h-[120px] resize-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button 
            type="submit" 
            className="self-end"
            disabled={!newMessage.trim() || isSending}
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationView;
