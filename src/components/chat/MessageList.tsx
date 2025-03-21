
/**
 * @fileoverview Componente para mostrar la lista de mensajes en una conversación
 * @module components/chat/MessageList
 */

import { useEffect, useRef } from 'react';
import { Message } from '@/core/domain/Message';
import MessageItem from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Desplazar automáticamente al último mensaje
  useEffect(() => {
    if (!isLoading && messagesEndRef.current && scrollAreaRef.current) {
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      };
      
      // Usar setTimeout para asegurar que el DOM se ha actualizado completamente
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading]);
  
  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="flex-1 h-full py-2 px-2"
    >
      <div className="space-y-4 px-2">
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
    </ScrollArea>
  );
};

export default MessageList;
