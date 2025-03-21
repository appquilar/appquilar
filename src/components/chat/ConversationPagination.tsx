
/**
 * @fileoverview Componente para la paginación de conversaciones
 * @module components/chat/ConversationPagination
 */

import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface ConversationPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginación para las conversaciones
 */
const ConversationPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: ConversationPaginationProps) => {
  const isMobile = useIsMobile();
  
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    onPageChange(page);
  };

  return (
    <div className="py-2 border-t border-border bg-background sticky bottom-0">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPage - 1);
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
                      onClick={handlePageChange(page)}
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
                  onClick={handlePageChange(page)}
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
                  onPageChange(currentPage + 1);
                }} 
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ConversationPagination;
