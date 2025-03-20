
/**
 * @fileoverview Componente para mostrar lista de conversaciones
 * @module components/chat/ConversationList
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/core/domain/Message';
import { MessageService } from '@/infrastructure/services/MessageService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

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
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si no hay conversaciones, mostrar mensaje
  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay conversaciones</h3>
        <p className="text-muted-foreground mt-2">
          Cuando contactes con empresas sobre productos, tus conversaciones aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul className="divide-y divide-border">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-4 flex gap-3 transition-colors hover:bg-secondary/50 ${
                selectedConversationId === conversation.id 
                  ? 'bg-secondary' 
                  : ''
              }`}
            >
              {/* Imagen del producto */}
              <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border border-border">
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
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
