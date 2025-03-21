
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
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

// Definir cuántas conversaciones mostrar por página
const ITEMS_PER_PAGE = 7; // Incrementado de 6 a 7

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
  const isMobile = useIsMobile();

  // Calcular páginas totales
  const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE);
  
  // Obtener conversaciones para la página actual
  const paginatedConversations = conversations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        <div className="py-2 border-t border-border bg-background sticky bottom-0">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }} 
                  />
                </PaginationItem>
              )}
              
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                
                // En móvil, mostrar menos páginas en la paginación
                if (isMobile && totalPages > 5) {
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  // Añadir puntos suspensivos
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                          ...
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                
                // En desktop, mostrar todas las páginas
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }} 
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
