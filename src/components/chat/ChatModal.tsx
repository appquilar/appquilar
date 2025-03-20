
/**
 * @fileoverview Componente modal para iniciar conversaciones
 * @module components/chat/ChatModal
 */

import { useState } from 'react';
import { MessageService } from '@/infrastructure/services/MessageService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  companyId: string;
  productName: string;
}

/**
 * Modal para iniciar una conversación sobre un producto
 */
const ChatModal = ({ 
  isOpen, 
  onClose, 
  productId, 
  companyId, 
  productName 
}: ChatModalProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const messageService = MessageService.getInstance();

  // Manejar el envío del mensaje inicial
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    if (!isLoggedIn || !user) {
      toast.error('Debes iniciar sesión para enviar mensajes');
      return;
    }
    
    try {
      setIsSending(true);
      
      await messageService.startConversation(
        productId,
        user.id,
        companyId,
        message.trim()
      );
      
      toast.success('Mensaje enviado correctamente');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contactar sobre {productName}</DialogTitle>
          <DialogDescription>
            Envía un mensaje al propietario para consultar sobre este producto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSendMessage} className="space-y-4 py-2">
          <Textarea
            placeholder="Escribe tu mensaje aquí..."
            className="min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!message.trim() || isSending}
              className="gap-2"
            >
              {isSending ? 'Enviando...' : 'Enviar mensaje'}
              <Send size={16} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
