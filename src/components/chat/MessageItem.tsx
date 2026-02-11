
/**
 * @fileoverview Componente para renderizar un mensaje individual en la conversación
 * @module components/chat/MessageItem
 */

import { Message } from '@/core/domain/Message';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isUserMessage: boolean;
}

/**
 * Renderiza un mensaje individual dentro de una conversación
 */
const MessageItem = ({ message, isUserMessage }: MessageItemProps) => {
  const formattedTime = format(message.timestamp, 'dd/MM/yyyy');
  
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
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
};

export default MessageItem;
