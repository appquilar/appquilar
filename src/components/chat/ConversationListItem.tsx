
/**
 * @fileoverview Componente para mostrar un elemento de la lista de conversaciones
 * @module components/chat/ConversationListItem
 */

import { Conversation } from '@/core/domain/Message';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);
  
  // Manejar error en la carga de imagen
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <li className="w-full">
      <button
        onClick={() => onSelect(conversation)}
        className={`w-full text-left p-3 sm:p-4 flex items-center gap-3 transition-colors hover:bg-secondary/50 ${
          isSelected ? 'bg-secondary' : ''
        }`}
      >
        {/* Imagen del producto */}
        <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden border border-border bg-secondary/20">
          {!imageError ? (
            <img 
              src={conversation.productImage} 
              alt={conversation.productName}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              {conversation.productName.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Información de la conversación */}
        <div className="grow min-w-0 overflow-hidden flex flex-col">
          <h4 className="font-medium text-sm sm:text-base truncate">
            {conversation.productName}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.companyName}
          </p>
          <p className="text-xs mt-1 truncate">
            hace {formatDistanceToNow(conversation.lastMessageAt, { 
              locale: es
            }).replace('alrededor de ', '')}
          </p>
        </div>
        
        {/* Indicador de mensajes no leídos */}
        {conversation.unreadCount > 0 && (
          <Badge variant="default" className="flex-shrink-0 rounded-full py-1 px-2.5 text-xs">
            {conversation.unreadCount}
          </Badge>
        )}
      </button>
    </li>
  );
};

export default ConversationListItem;
