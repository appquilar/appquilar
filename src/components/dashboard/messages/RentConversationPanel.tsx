import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Italic, Send, Smile } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  useCreateRentalMessage,
  useMarkRentMessagesAsRead,
  useRentalMessages,
  useUpdateRentStatusFromMessages,
} from '@/application/hooks/useRentalMessages';
import { Rental, RentStatus } from '@/domain/models/Rental';
import { RentalStatusService } from '@/domain/services/RentalStatusService';
import { RentalStateMachineService } from '@/domain/services/RentalStateMachineService';
import { RentConversationRole } from '@/domain/models/RentConversation';

interface RentConversationPanelProps {
  rentId: string;
  rental: Rental;
  viewerRole: RentConversationRole;
  unreadCount: number;
}

interface MessageFormValues {
  content: string;
}

const WIZARD_STEPS: RentStatus[] = [
  'proposal_pending_renter',
  'rental_confirmed',
  'rental_active',
  'rental_completed',
];

const getWizardStepLabel = (status: RentStatus): string => {
  if (status === 'proposal_pending_renter') {
    return 'Oferta / Propuesta';
  }

  return RentalStatusService.getStatusLabel(status);
};

const formatTimestamp = (date: Date): string =>
  date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const roleLabel: Record<'owner' | 'renter' | 'system', string> = {
  owner: 'Tienda',
  renter: 'Cliente',
  system: 'Sistema',
};

const EMOJIS = ['😀', '😉', '👍', '🙏', '🎉', '🔥', '🙂', '🤝', '📦', '✅'];

const toDateInput = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseDateInput = (value: string): Date => {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day, 0, 0, 0);
};

const RentConversationPanel = ({
  rentId,
  rental,
  viewerRole,
  unreadCount,
}: RentConversationPanelProps) => {
  const rentalStatus: RentStatus = rental.status;
  const isCancelled = rentalStatus === 'cancelled';
  const publicProductHref = `/product/${rental.productSlug ?? rental.productId}`;
  const [proposalValidUntil, setProposalValidUntil] = useState<string>(
    rental.proposalValidUntil ? toDateInput(rental.proposalValidUntil) : ''
  );
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  const workflowSteps = WIZARD_STEPS;
  const effectiveCurrentStatus: RentStatus =
    rental.status === 'lead_pending' ? 'proposal_pending_renter' : rental.status;
  const currentStepIndex = workflowSteps.findIndex((step) => step === effectiveCurrentStatus);
  const availableStatusTransitions = useMemo(
    () => RentalStateMachineService.getNextTransitions(rental, viewerRole, new Date()),
    [rental, viewerRole]
  );
  const nonCancelStatusTransitions = useMemo(
    () => availableStatusTransitions.filter((transition) => transition.to !== 'cancelled'),
    [availableStatusTransitions]
  );

  const { messages, isLoading, error } = useRentalMessages(
    rentId,
    { page: 1, perPage: 200 },
    { pollingEnabled: !isCancelled }
  );
  const createMessageMutation = useCreateRentalMessage(rentId);
  const markAsReadMutation = useMarkRentMessagesAsRead(rentId);
  const updateStatusMutation = useUpdateRentStatusFromMessages(rentId);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<MessageFormValues>({
    defaultValues: {
      content: '',
    },
  });

  const contentValue = form.watch('content') ?? '';
  const isInputDisabled = isCancelled || createMessageMutation.isPending;
  const latestSystemMessageId = useMemo(() => {
    const latestSystemMessage = [...messages].reverse().find((message) => message.senderRole === 'system');
    return latestSystemMessage?.id ?? null;
  }, [messages]);

  const shouldRenderStatusActionsFallback = nonCancelStatusTransitions.length > 0 && latestSystemMessageId === null;

  useEffect(() => {
    setProposalValidUntil(rental.proposalValidUntil ? toDateInput(rental.proposalValidUntil) : '');
  }, [rental.id, rental.proposalValidUntil]);

  useEffect(() => {
    if (!rentId || unreadCount <= 0 || isLoading || markAsReadMutation.isPending) {
      return;
    }

    markAsReadMutation.mutate();
  }, [rentId, unreadCount, isLoading, markAsReadMutation]);

  useEffect(() => {
    if (isLoading || !bottomRef.current) {
      return;
    }

    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [rentId, messages.length, isLoading]);

  const syncFormContent = () => {
    const nextValue = editorRef.current?.innerText ?? '';
    form.setValue('content', nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const applyTextCommand = (command: 'bold' | 'italic') => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command);
    syncFormContent();
  };

  const insertEmoji = (emoji: string) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand('insertText', false, emoji);
    syncFormContent();
  };

  const onSubmit = async (values: MessageFormValues) => {
    if (isCancelled) {
      form.setError('content', {
        type: 'manual',
        message: 'Este alquiler esta cancelado y no admite nuevos mensajes.',
      });
      return;
    }

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
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    } catch (_error) {
      form.setError('content', {
        type: 'server',
        message: 'No se pudo enviar el mensaje. Intentalo de nuevo.',
      });
    }
  };

  const handleStatusTransition = async (status: RentStatus, requiresProposalValidUntil?: boolean) => {
    setStatusActionError(null);

    try {
      await updateStatusMutation.mutateAsync({
        status,
        proposalValidUntil: requiresProposalValidUntil
          ? (proposalValidUntil ? parseDateInput(proposalValidUntil) : null)
          : undefined,
      });
    } catch (_error) {
      setStatusActionError('No se pudo cambiar el estado. Revisa los datos e intentalo de nuevo.');
    }
  };

  const renderStatusActions = () => {
    if (nonCancelStatusTransitions.length === 0) {
      return null;
    }

    const requiresProposalValidUntil = nonCancelStatusTransitions.some((transition) => transition.requiresProposalValidUntil);

    return (
      <div className="mt-3 space-y-2">
        {requiresProposalValidUntil && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600">Propuesta válida hasta (opcional)</p>
            <Input
              type="date"
              lang="es-ES"
              value={proposalValidUntil}
              onChange={(event) => setProposalValidUntil(event.target.value)}
              disabled={updateStatusMutation.isPending}
              className="bg-white"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {nonCancelStatusTransitions.map((transition) => (
            <Button
              key={transition.to}
              size="sm"
              variant="default"
              className="w-full sm:w-auto"
              disabled={updateStatusMutation.isPending}
              onClick={() => handleStatusTransition(transition.to, transition.requiresProposalValidUntil)}
            >
              {transition.label}
            </Button>
          ))}
        </div>
        {statusActionError && (
          <p className="text-xs text-destructive">{statusActionError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Conversacion del alquiler</h2>
          <Badge className={RentalStatusService.getStatusBadgeClasses(rentalStatus)}>
            {RentalStatusService.getStatusLabel(rentalStatus)}
          </Badge>
        </div>
      </div>

      {viewerRole === 'renter' && (
        <div className="border-b px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Estado del alquiler
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            {workflowSteps.map((step, index) => {
              const isCurrent = step === effectiveCurrentStatus;
              const isCompleted = currentStepIndex > -1 && index < currentStepIndex;

              return (
                <div
                  key={step}
                  className={`rounded-md border px-3 py-2 text-xs ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-border'
                  }`}
                >
                  <p className="font-medium">{getWizardStepLabel(step)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0 px-4 py-3">
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
          <div className="space-y-3">
            <div className="h-full min-h-24 flex items-center justify-center text-sm text-muted-foreground">
              No hay mensajes todavia.
            </div>
            {shouldRenderStatusActionsFallback && (
              <div className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-800">
                <p className="text-sm font-medium">Acciones de estado</p>
                {renderStatusActions()}
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((message) => {
              const isSystemMessage = message.senderRole === 'system';
              const isLatestSystemMessage = latestSystemMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isSystemMessage ? 'w-full' : message.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isSystemMessage
                        ? 'w-full border border-slate-300 bg-slate-100 text-slate-800'
                        : message.isMine
                        ? 'max-w-[85%] bg-primary text-primary-foreground rounded-tr-none'
                        : 'max-w-[85%] bg-secondary text-secondary-foreground rounded-tl-none'
                    }`}
                  >
                    {!isSystemMessage && (
                      <p className="text-xs font-medium opacity-85 mb-1">
                        {message.senderName} · {roleLabel[message.senderRole]}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="text-[11px] opacity-75 mt-1">
                      {formatTimestamp(message.createdAt)}
                    </p>
                    {isSystemMessage && isLatestSystemMessage && renderStatusActions()}
                  </div>
                </div>
              );
            })}
            {shouldRenderStatusActionsFallback && (
              <div className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-800">
                <p className="text-sm font-medium">Acciones de estado</p>
                {renderStatusActions()}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t px-4 py-3">
        {isCancelled && (
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            El alquiler ha sido cancelado. Si quieres retomarlo, tendras que generar uno nuevo haciendo click{' '}
            <Link to={publicProductHref} className="underline font-medium">
              aqui
            </Link>
            .
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <input
            type="hidden"
            {...form.register('content', {
              validate: {
                notBlank: (value) => value.trim().length > 0 || 'Escribe un mensaje',
                maxLength: (value) => value.length <= 2000 || 'Maximo 2000 caracteres',
              },
            })}
          />

          <div className="rounded-md border bg-background">
            <div className="flex items-center gap-1 border-b px-2 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => applyTextCommand('bold')}
                disabled={isInputDisabled}
                aria-label="Negrita"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => applyTextCommand('italic')}
                disabled={isInputDisabled}
                aria-label="Cursiva"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={isInputDisabled}
                    aria-label="Insertar emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-5 gap-1">
                    {EMOJIS.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-base"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {contentValue.length}/2000
              </span>
            </div>

            <div className="relative">
              {contentValue.length === 0 && (
                <p className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
                  {isCancelled ? 'Conversacion cerrada por cancelacion.' : 'Escribe un mensaje...'}
                </p>
              )}
              <div
                ref={editorRef}
                contentEditable={!isInputDisabled}
                className="min-h-[110px] max-h-[220px] overflow-y-auto p-3 pr-24 pb-12 text-sm outline-none whitespace-pre-wrap break-words"
                onInput={syncFormContent}
                onBlur={syncFormContent}
                role="textbox"
                aria-label="Mensaje"
                data-testid="rent-message-editor"
              />
              <Button
                type="submit"
                disabled={isInputDisabled}
                className="absolute bottom-2 right-2 h-8 gap-2 px-3"
              >
                <Send className="h-4 w-4" />
                {createMessageMutation.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>

          {form.formState.errors.content?.message && (
            <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RentConversationPanel;
