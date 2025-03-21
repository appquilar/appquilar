
/**
 * @fileoverview Componente para mostrar un elemento de la lista de conversaciones
 * @module components/chat/ConversationListItem
 */

import { Conversation } from '@/core/domain/Message';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

/**
 * Renderiza un elemento individual de la lista de conversaciones
 */
const ConversationListItem = ({ 
  conversation, 
  isSelected, 
  onSelect 
}: ConversationListItemProps) => {
  const isMobile = useIsMobile();
  
  return (
    <li>
      <button
        onClick={() => onSelect(conversation)}
        className={`w-full text-left p-3 sm:p-4 flex gap-3 transition-colors hover:bg-secondary/50 ${
          isSelected ? 'bg-secondary' : ''
        }`}
      >
        {/* Imagen del producto */}
        <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden border border-border">
          <img 
            src={conversation.productImage} 
            alt={conversation.productName}
            className="w-full h-full object-cover"
          />
          
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
              {conversation.unreadCount}
            </div>
          )}
        </div>
        
        {/* Información de la conversación */}
        <div className="flex-1 overflow-hidden">
          <h4 className="font-medium text-sm truncate">
            {conversation.productName}
          </h4>
          <p className="text-xs text-muted-foreground">
            {conversation.companyName}
          </p>
          <p className="text-xs mt-1">
            {formatDistanceToNow(conversation.lastMessageAt, { 
              addSuffix: true,
              locale: es
            })}
          </p>
        </div>
      </button>
    </li>
  );
};

export default ConversationListItem;
