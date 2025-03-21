
/**
 * @fileoverview Componente para mostrar lista de conversaciones
 * @module components/chat/ConversationList
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/core/domain/Message';
import { MessageService } from '@/infrastructure/services/MessageService';
import ConversationListItem from './ConversationListItem';
import EmptyConversationList from './EmptyConversationList';
import ConversationListSkeleton from './ConversationListSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

/**
 * Lista de conversaciones del usuario
 */
const ConversationList = ({ 
  onSelectConversation, 
  selectedConversationId 
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const messageService = MessageService.getInstance();

  // Cargar conversaciones al inicializar
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userConversations = await messageService.getUserConversations(user.id);
        
        // Ordenar por fecha del último mensaje (más reciente primero)
        setConversations(
          userConversations.sort((a, b) => 
            b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
          )
        );
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
    
    // Configurar un intervalo para actualizar periódicamente
    const intervalId = setInterval(loadConversations, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  // Si no hay conversaciones, mostrar mensaje
  if (conversations.length === 0) {
    return <EmptyConversationList />;
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-full">
        <ul className="divide-y divide-border">
          {conversations.map((conversation) => (
            <ConversationListItem 
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onSelect={onSelectConversation}
            />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
