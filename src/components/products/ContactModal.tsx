import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres" })
    .max(1000, { message: "El mensaje no puede exceder 1000 caracteres" })
});

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  ownerName: string;
}

const ContactModal = ({ isOpen, onClose, productName, ownerName }: ContactModalProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    // Validate input
    const result = messageSchema.safeParse({ message });
    
    if (!result.success) {
      setErrors(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Mensaje enviado correctamente", {
        description: `${ownerName} recibirá tu mensaje pronto`
      });
      
      setMessage('');
      onClose();
    } catch (error) {
      toast.error("Error al enviar el mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contactar para alquilar</DialogTitle>
          <DialogDescription>
            Envía un mensaje a {ownerName} sobre "{productName}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className={errors ? "border-destructive" : ""}
            />
            {errors && (
              <p className="text-sm text-destructive">{errors}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 caracteres
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
