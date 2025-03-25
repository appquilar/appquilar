
/**
 * @fileoverview Componente para mostrar lista de conversaciones
 * @module components/chat/ConversationList
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/core/domain/Message';
import { MessageService } from '@/infrastructure/services/MessageService';
import { supabase } from '@/integrations/supabase/client';
import ConversationListItem from './ConversationListItem';
import EmptyConversationList from './EmptyConversationList';
import ConversationListSkeleton from './ConversationListSkeleton';
import ConversationPagination from './ConversationPagination';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

// Definir cuántas conversaciones mostrar por página
const ITEMS_PER_PAGE = 7;

/**
 * Lista de conversaciones del usuario
 */
const ConversationList = ({ 
  onSelectConversation, 
  selectedConversationId 
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const messageService = MessageService.getInstance();
  const conversationsRef = useRef<Conversation[]>([]);

  // Calcular páginas totales
  const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE);
  
  // Obtener conversaciones para la página actual
  const paginatedConversations = conversations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Cargar conversaciones completas solo al inicializar
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userConversations = await messageService.getUserConversations(user.id);
        
        // Ordenar por fecha del último mensaje (más reciente primero)
        const sortedConversations = userConversations.sort((a, b) => 
          b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        );
        
        setConversations(sortedConversations);
        conversationsRef.current = sortedConversations;
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user]);
  
  // Suscribirse a actualizaciones en tiempo real de conversaciones
  useEffect(() => {
    if (!user) return;
    
    // Suscribirse a cambios en la tabla de conversaciones
    const channel = supabase
      .channel('public:conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Cambio detectado en conversaciones:', payload);
          
          // Actualizar las conversaciones desde el servidor
          const userConversations = await messageService.getUserConversations(user.id);
          
          // Ordenar por fecha del último mensaje
          const sortedConversations = userConversations.sort((a, b) => 
            b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
          );
          
          setConversations(sortedConversations);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Manejar cambio de página desde la paginación
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
      <ScrollArea className="flex-1">
        <ul className="divide-y divide-border">
          {paginatedConversations.map((conversation) => (
            <ConversationListItem 
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onSelect={onSelectConversation}
            />
          ))}
        </ul>
      </ScrollArea>
      
      {totalPages > 1 && (
        <div className="mt-auto">
          <ConversationPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ConversationList;
