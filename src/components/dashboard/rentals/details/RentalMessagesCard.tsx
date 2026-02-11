import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import { useCreateRentalMessage, useRentalMessages } from '@/application/hooks/useRentalMessages';

interface RentalMessagesCardProps {
  rentId: string;
}

interface RentalMessageFormValues {
  content: string;
}

const formatTimestamp = (date: Date, includeTime: boolean = true): string =>
  includeTime
    ? date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

const senderRoleLabel: Record<'owner' | 'renter', string> = {
  owner: 'Tienda',
  renter: 'Cliente',
};

const RentalMessagesCard = ({ rentId }: RentalMessagesCardProps) => {
  const { messages, isLoading, error } = useRentalMessages(rentId, { page: 1, perPage: 200 });
  const createMessageMutation = useCreateRentalMessage(rentId);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<RentalMessageFormValues>({
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const onSubmit = async (values: RentalMessageFormValues) => {
    const content = values.content.trim();

    if (!content) {
      form.setError('content', {
        type: 'validate',
        message: 'Escribe un mensaje',
      });
      return;
    }

    try {
      await createMessageMutation.mutateAsync(content);
      form.reset({ content: '' });
    } catch (_error) {
      form.setError('content', {
        type: 'server',
        message: 'No se pudo enviar el mensaje. Intentalo de nuevo.',
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Conversacion</h3>
        </div>

        <ScrollArea className="h-[340px] rounded-md border px-3 py-2">
          {isLoading && (
            <div className="h-full min-h-24 flex items-center justify-center text-sm text-muted-foreground">
              Cargando mensajes...
            </div>
          )}

          {!isLoading && error && (
            <div className="h-full min-h-24 flex items-center justify-center text-sm text-destructive">
              {error}
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div className="h-full min-h-24 flex items-center justify-center text-sm text-muted-foreground">
              Todavia no hay mensajes en este alquiler.
            </div>
          )}

          {!isLoading && !error && messages.length > 0 && (
            <div className="space-y-3 py-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.isMine
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-secondary text-secondary-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="text-xs font-medium opacity-85 mb-1">
                      {message.senderName} · {senderRoleLabel[message.senderRole]}
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="text-[11px] opacity-75 mt-1">
                      {formatTimestamp(message.createdAt, message.senderRole !== 'system')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="content"
              rules={{
                validate: {
                  notBlank: (value) => value.trim().length > 0 || 'Escribe un mensaje',
                  maxLength: (value) => value.length <= 2000 || 'Maximo 2000 caracteres',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escribe un mensaje para este alquiler..."
                      className="min-h-[90px] resize-y"
                      disabled={createMessageMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createMessageMutation.isPending}
                className="inline-flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {createMessageMutation.isPending ? 'Enviando...' : 'Enviar mensaje'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RentalMessagesCard;
