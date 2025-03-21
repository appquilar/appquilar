
/**
 * @fileoverview Componente de bandeja de entrada de chat
 * @module components/chat/ChatInbox
 */

import { useState } from 'react';
import { Conversation } from '@/core/domain/Message';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { MessageCircle } from 'lucide-react';

/**
 * Bandeja de entrada de mensajes del usuario
 */
const ChatInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden md:grid md:grid-cols-3">
      {/* Lista de conversaciones (siempre visible en desktop, condicional en mobile) */}
      <div className={`md:col-span-1 md:border-r border-border flex flex-col h-full ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
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
      
      {/* Vista de conversación */}
      <div className={`flex flex-col md:col-span-2 h-full overflow-hidden ${selectedConversation ? 'block' : 'hidden md:flex md:items-center md:justify-center'}`}>
        {selectedConversation ? (
          <ConversationView 
            conversation={selectedConversation} 
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Selecciona una conversación</h3>
            <p className="text-muted-foreground mt-2">
              Elige una conversación de la lista para ver los mensajes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
