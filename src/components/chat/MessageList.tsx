
/**
 * @fileoverview Componente para mostrar la lista de mensajes en una conversación
 * @module components/chat/MessageList
 */

import { useEffect, useRef } from 'react';
import { Message } from '@/core/domain/Message';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userId?: string;
}

/**
 * Lista de mensajes de una conversación con scroll automático
 */
const MessageList = ({ messages, isLoading, userId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Desplazar automáticamente al último mensaje
  useEffect(() => {
    if (!isLoading && messagesEndRef.current && scrollContainerRef.current) {
      const scrollToBottom = () => {
        // Intentar múltiples métodos de scroll para mayor compatibilidad
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
      };
      
      // Usar setTimeout para asegurar que el DOM se ha actualizado completamente
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading]);
  
  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto py-2 px-4 space-y-4"
    >
      {isLoading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-center p-4">
          <p className="text-muted-foreground">No hay mensajes en esta conversación.</p>
        </div>
      ) : (
        messages.map((message) => {
          const isUserMessage = message.senderType === 'user';
          
          return (
            <MessageItem 
              key={message.id}
              message={message}
              isUserMessage={isUserMessage}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
