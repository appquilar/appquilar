
/**
 * @fileoverview Componente de cabecera para la vista de conversación
 * @module components/chat/ChatHeader
 */

import { Conversation } from '@/core/domain/Message';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
}

/**
 * Cabecera de una conversación con información del producto y navegación
 */
const ChatHeader = ({ conversation, onBack }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-background sticky top-0 z-10">
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
        <p className="text-xs text-muted-foreground">Usuario: <span className="font-medium">{conversation.userName}</span></p>
      </div>
    </div>
  );
};

export default ChatHeader;
