
/**
 * @fileoverview Componente para mostrar lista de conversaciones
 * @module components/chat/ConversationList
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/core/domain/Message';
import { MessageService } from '@/infrastructure/services/MessageService';
import ConversationListItem from './ConversationListItem';
import EmptyConversationList from './EmptyConversationList';
import ConversationListSkeleton from './ConversationListSkeleton';
import ConversationPagination from './ConversationPagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import useEmblaCarousel from 'embla-carousel-react';

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
  
  // Configurar el carrusel con Embla
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
  });

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

  // Actualizar el embla cuando el currentPage cambie
  useEffect(() => {
    if (emblaApi && emblaApi.scrollTo) {
      emblaApi.scrollTo(currentPage - 1);
    }
  }, [currentPage, emblaApi]);

  // Añadir listener para detectar cambios de slide
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentPage(emblaApi.selectedScrollSnap() + 1);
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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

  // Preparar los grupos de conversaciones para carrusel
  const conversationPages = Array.from({ length: totalPages }, (_, i) => {
    const startIdx = i * ITEMS_PER_PAGE;
    return conversations.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="w-full flex-1">
        <div ref={emblaRef} className="overflow-hidden h-full">
          <div className="flex h-full">
            {conversationPages.map((pageConversations, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 flex-grow-0 min-w-full h-full"
                style={{ 
                  flex: '0 0 100%' 
                }}
              >
                <ScrollArea className="h-full">
                  <ul className="divide-y divide-border">
                    {pageConversations.map((conversation) => (
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
            ))}
          </div>
        </div>
      </div>
      
      <ConversationPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ConversationList;
