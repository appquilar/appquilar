
/**
 * @fileoverview Componente de cabecera para la vista de conversación
 * @module components/chat/ChatHeader
 */

import { Conversation } from '@/core/domain/Message';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, MoreVertical, PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onCreateRental: () => void;
}

/**
 * Cabecera de una conversación con información del producto y navegación
 */
const ChatHeader = ({ conversation, onBack, onCreateRental }: ChatHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center gap-3 p-3 md:p-4 border-b border-border bg-background sticky top-0 z-10 w-full">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onBack}
        className={isMobile ? "flex" : "hidden md:flex"}
      >
        <ArrowLeft size={18} />
        <span className="sr-only">Volver</span>
      </Button>
      
      <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-border">
        <img 
          src={conversation.productImage} 
          alt={conversation.productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for broken images
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm md:text-base truncate">{conversation.productName}</h3>
        <p className="text-xs text-muted-foreground truncate">{conversation.companyName}</p>
        {!isMobile && (
          <p className="text-xs text-muted-foreground">Usuario: <span className="font-medium">{conversation.userName}</span></p>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical size={18} />
            <span className="sr-only">Más opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCreateRental}>
            <PlusCircle size={16} className="mr-2" />
            Crear alquiler
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Info size={16} className="mr-2" />
            Ver detalles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader;
