import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Check, Clock, Italic, Send, Smile } from 'lucide-react';
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
import type { RentalMessage } from '@/domain/models/RentalMessage';

interface RentConversationPanelProps {
  rentId: string;
  rental: Rental;
  viewerRole: RentConversationRole;
  unreadCount: number;
  isSummaryOpen: boolean;
  onToggleSummary: () => void;
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

type DeliveryStatus = 'sending' | 'sent' | 'failed';

type MessageWithStatus = RentalMessage & {
  localId?: string;
  isOptimistic?: boolean;
  deliveryStatus?: DeliveryStatus;
  sequence?: number;
};

const RentConversationPanel = ({
  rentId,
  rental,
  viewerRole,
  unreadCount,
  isSummaryOpen,
  onToggleSummary,
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
  const sendQueueRef = useRef<MessageWithStatus[]>([]);
  const isSendingRef = useRef(false);
  const sequenceRef = useRef(0);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageWithStatus[]>([]);

  const form = useForm<MessageFormValues>({
    defaultValues: {
      content: '',
    },
  });

  const contentValue = form.watch('content') ?? '';
  const isInputDisabled = isCancelled;
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
  }, [rentId, messages.length, optimisticMessages.length, isLoading]);

  useEffect(() => {
    if (optimisticMessages.length === 0) {
      return;
    }

    setOptimisticMessages((previous) =>
      previous.filter((optimistic) => {
        if (!optimistic.isOptimistic || optimistic.deliveryStatus !== 'sent') {
          return true;
        }

        const match = messages.some((message) => {
          if (!message.isMine) {
            return false;
          }

          if (message.content.trim() !== optimistic.content.trim()) {
            return false;
          }

          const diff = Math.abs(message.createdAt.getTime() - optimistic.createdAt.getTime());
          return diff <= 60000;
        });

        return !match;
      })
    );
  }, [messages, optimisticMessages.length]);

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

  const processQueue = async () => {
    if (isSendingRef.current) {
      return;
    }

    isSendingRef.current = true;

    while (sendQueueRef.current.length > 0) {
      const nextMessage = sendQueueRef.current[0];

      try {
        await createMessageMutation.mutateAsync(nextMessage.content);
        setOptimisticMessages((previous) =>
          previous.map((message) =>
            message.localId === nextMessage.localId
              ? { ...message, deliveryStatus: 'sent' }
              : message
          )
        );
      } catch (_error) {
        setOptimisticMessages((previous) =>
          previous.map((message) =>
            message.localId === nextMessage.localId
              ? { ...message, deliveryStatus: 'failed' }
              : message
          )
        );
      } finally {
        sendQueueRef.current.shift();
      }
    }

    isSendingRef.current = false;
  };

  const retryMessage = (messageId: string) => {
    const target = optimisticMessages.find((message) => message.localId === messageId);
    if (!target) {
      return;
    }

    setOptimisticMessages((previous) =>
      previous.map((message) =>
        message.localId === messageId
          ? { ...message, deliveryStatus: 'sending' }
          : message
      )
    );

    sendQueueRef.current = [...sendQueueRef.current, { ...target, deliveryStatus: 'sending' }];
    void processQueue();
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

    const senderName =
      viewerRole === 'owner'
        ? rental.ownerName ?? 'Tienda'
        : rental.renterName ?? 'Cliente';

    const localId = `local-${Date.now()}-${sequenceRef.current}`;
    const newMessage: MessageWithStatus = {
      id: localId,
      localId,
      isOptimistic: true,
      deliveryStatus: 'sending',
      sequence: sequenceRef.current,
      rentId,
      senderRole: viewerRole,
      senderName,
      content,
      createdAt: new Date(),
      isMine: true,
    };

    sequenceRef.current += 1;
    setOptimisticMessages((previous) => [...previous, newMessage]);
    sendQueueRef.current = [...sendQueueRef.current, newMessage];
    void processQueue();

    form.reset({ content: '' });
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleSummary}
              className="h-7 px-2 text-xs"
            >
              {isSummaryOpen ? 'Ocultar detalles' : 'Ver detalles'}
            </Button>
            <Badge className={RentalStatusService.getStatusBadgeClasses(rentalStatus)}>
              {RentalStatusService.getStatusLabel(rentalStatus)}
            </Badge>
          </div>
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

        {!isLoading && !error && messages.length === 0 && optimisticMessages.length === 0 && (
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

        {!isLoading && !error && (messages.length > 0 || optimisticMessages.length > 0) && (
          <div className="space-y-3">
            {[...messages, ...optimisticMessages]
              .sort((a, b) => {
                const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
                if (timeDiff !== 0) return timeDiff;
                return (a.sequence ?? 0) - (b.sequence ?? 0);
              })
              .map((message) => {
              const isSystemMessage = message.senderRole === 'system';
              const isLatestSystemMessage = latestSystemMessageId === message.id;
              const isMine = message.isMine;
              const deliveryStatus: DeliveryStatus | 'sent' =
                message.isOptimistic
                  ? message.deliveryStatus ?? 'sending'
                  : isMine
                  ? 'sent'
                  : 'sent';

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
                    <div className="mt-1 flex items-center gap-2 text-[11px] opacity-75">
                      <span>{formatTimestamp(message.createdAt)}</span>
                      {!isSystemMessage && isMine && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          {deliveryStatus === 'sending' ? (
                            <>
                              <Clock className="h-3 w-3" />
                              Enviando
                            </>
                          ) : deliveryStatus === 'failed' ? (
                            <>
                              Error al enviar
                              <button
                                type="button"
                                className="ml-1 text-xs font-medium text-primary hover:underline"
                                onClick={() => retryMessage(message.localId ?? '')}
                              >
                                Reintentar
                              </button>
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              Enviado
                            </>
                          )}
                        </span>
                      )}
                    </div>
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
                Enviar
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
