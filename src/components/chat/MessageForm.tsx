
/**
 * @fileoverview Componente de formulario para enviar mensajes
 * @module components/chat/MessageForm
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface MessageFormProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
}

/**
 * Formulario para redactar y enviar mensajes
 */
const MessageForm = ({ onSendMessage, isSending }: MessageFormProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error en formulario al enviar mensaje:', error);
    }
  };

  return (
    <div className="border-t border-border p-3 bg-background sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          placeholder="Escribe tu mensaje..."
          className="min-h-[50px] max-h-[100px] resize-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
        />
        <Button 
          type="submit" 
          size="icon"
          className="h-[50px] flex-shrink-0" 
          disabled={!newMessage.trim() || isSending}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default MessageForm;
