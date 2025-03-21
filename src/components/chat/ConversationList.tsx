
/**
 * @fileoverview Componente para mostrar lista de conversaciones
 * @module components/chat/ConversationList
 */

import { useEffect, useState, useRef, useCallback } from 'react';
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
import type { UseEmblaCarouselType } from 'embla-carousel-react';

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
  
  // Referencia para el carrusel
  const [emblaRef, emblaApi] = useRef<UseEmblaCarouselType>([null, null]);

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
    if (emblaApi[1] && emblaApi[1].scrollTo) {
      emblaApi[1].scrollTo(currentPage - 1);
    }
  }, [currentPage]);

  // Añadir listener para detectar cambios de slide
  useEffect(() => {
    const api = emblaApi[1];
    if (!api) return;

    const onSelect = () => {
      setCurrentPage(api.selectedScrollSnap() + 1);
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
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
      <Carousel 
        className="w-full flex-1"
        opts={{
          align: 'start',
          loop: false,
        }}
        setApi={(api) => {
          emblaApi[1] = api;
        }}
        defaultSlide={currentPage - 1}
      >
        <CarouselContent className="h-full -ml-0 -mt-0">
          {conversationPages.map((pageConversations, index) => (
            <CarouselItem key={index} className="w-full pl-0 pt-0 h-full">
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
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <ConversationPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ConversationList;
