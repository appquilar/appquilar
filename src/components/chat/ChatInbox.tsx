
/**
 * @fileoverview Componente de bandeja de entrada de chat
 * @module components/chat/ChatInbox
 */

import { useState, useEffect } from 'react';
import { Conversation } from '@/core/domain/Message';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { MessageCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/application/hooks/useConversations';

/**
 * Bandeja de entrada de mensajes del usuario
 */
const ChatInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations, isLoading } = useConversations();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Reset selected conversation when changing to mobile view if a conversation was selected
  useEffect(() => {
    if (isMobile && selectedConversation) {
      setSelectedConversation(null);
    }
  }, [isMobile]);

  // Si no hay usuario autenticado, mostrar mensaje
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30 p-4">
        <div className="text-center max-w-md bg-background p-6 rounded-lg shadow-sm border border-border">
          <MessageCircle className="mx-auto h-12 w-12 text-primary/60 mb-4" />
          <h3 className="text-lg font-medium mb-2">Inicia sesión para ver tus mensajes</h3>
          <p className="text-muted-foreground">
            Necesitas iniciar sesión para poder ver y gestionar tus conversaciones con propietarios de productos.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="conversations" className="w-full h-full">
      <div className="flex h-full">
        {/* Lista de conversaciones - siempre visible en desktop */}
        <div 
          className={`${
            isMobile ? (
              selectedConversation ? 'hidden' : 'w-full'
            ) : 'w-1/3 border-r border-border'
          } h-full flex flex-col`}
        >
          <div className="sticky top-0 z-10 p-3 md:p-4 border-b border-border bg-background flex justify-between items-center">
            <h2 className="text-base font-medium flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              Conversaciones
            </h2>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ConversationList 
                onSelectConversation={setSelectedConversation}
                selectedConversationId={selectedConversation?.id}
              />
            )}
          </div>
        </div>
        
        {/* Vista de conversación */}
        <div 
          className={`${
            isMobile ? (
              selectedConversation ? 'w-full' : 'hidden'
            ) : 'w-2/3'
          } h-full flex flex-col`}
        >
          {selectedConversation ? (
            <ConversationView 
              conversation={selectedConversation} 
              onBack={() => setSelectedConversation(null)}
            />
          ) : isMobile ? null : (
            <div className="flex items-center justify-center h-full p-6 bg-muted/10">
              <div className="text-center max-w-sm">
                <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MessageCircle size={32} className="text-primary/80" />
                </div>
                <h3 className="text-xl font-medium mb-2">Selecciona una conversación</h3>
                <p className="text-muted-foreground">
                  Elige una conversación de la lista para ver y responder los mensajes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Tabs>
  );
};

export default ChatInbox;
