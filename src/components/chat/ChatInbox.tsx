
/**
 * @fileoverview Componente de bandeja de entrada de chat
 * @module components/chat/ChatInbox
 */

import { useState } from 'react';
import { Conversation } from '@/core/domain/Message';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

/**
 * Bandeja de entrada de mensajes del usuario
 */
const ChatInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex w-full h-full border border-border rounded-lg overflow-hidden ${!selectedConversation ? 'md:block' : 'md:grid md:grid-cols-3'}`}>
      {/* Lista de conversaciones (siempre visible en desktop si no hay conversación seleccionada, o como columna si hay una seleccionada) */}
      <div className={`${selectedConversation ? 'md:col-span-1 md:border-r border-border' : 'w-full'} flex flex-col h-full overflow-hidden ${selectedConversation && isMobile ? 'hidden' : 'flex'}`}>
        <div className="sticky top-0 z-10 p-4 border-b border-border bg-background">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <MessageCircle size={18} />
            Conversaciones
          </h2>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ConversationList 
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>
      </div>
      
      {/* Vista de conversación - solo mostrar si hay una conversación seleccionada */}
      {selectedConversation && (
        <div className={`flex flex-col md:col-span-2 h-full overflow-hidden ${selectedConversation || !isMobile ? 'block' : 'hidden'}`}>
          <ConversationView 
            conversation={selectedConversation} 
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInbox;
