import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { SeoService } from '@/infrastructure/services/SeoService';
import { useRentConversations } from '@/application/hooks/useRentConversations';
import { RentStatus } from '@/domain/models/Rental';
import RentConversationList, { ConversationStatusFilter } from '@/components/dashboard/messages/RentConversationList';
import RentConversationPanel from '@/components/dashboard/messages/RentConversationPanel';
import RentConversationSummary from '@/components/dashboard/messages/RentConversationSummary';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import DashboardSectionHeader from '@/components/dashboard/common/DashboardSectionHeader';

const OPEN_EXCLUDED_STATUSES: RentStatus[] = ['rental_completed', 'cancelled'];

const MessagesDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConversationStatusFilter>('open_only');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const suppressAutoSelectRef = useRef(false);

  const { conversations, isLoading, error } = useRentConversations();

  const initialRentId = searchParams.get('rent_id');
  const [selectedRentId, setSelectedRentId] = useState<string | null>(initialRentId);

  useEffect(() => {
    const setupSeo = async () => {
      const seoService = SeoService.getInstance();
      const seoInfo = await seoService.getSeoInfo('dashboard');
      document.title = 'Mensajes | ' + seoInfo.title;
    };

    setupSeo();
  }, []);

  useEffect(() => {
    const updateAvailableHeight = () => {
      if (!containerRef.current) {
        return;
      }

      const top = containerRef.current.getBoundingClientRect().top;
      const rawHeight = Math.floor(window.innerHeight - top - 8);
      const minHeight = isMobile ? 0 : 420;
      const nextHeight = minHeight > 0 ? Math.max(minHeight, rawHeight) : Math.max(0, rawHeight);
      setAvailableHeight(nextHeight);
    };

    updateAvailableHeight();
    window.addEventListener('resize', updateAvailableHeight);

    return () => {
      window.removeEventListener('resize', updateAvailableHeight);
    };
  }, [isMobile]);

  useEffect(() => {
    setIsSummaryOpen(!isMobile);
  }, [isMobile]);

  const filteredConversations = useMemo(() => {
    if (statusFilter === 'open_only') {
      return conversations.filter((conversation) => !OPEN_EXCLUDED_STATUSES.includes(conversation.rental.status));
    }

    return conversations.filter((conversation) => conversation.rental.status === statusFilter);
  }, [conversations, statusFilter]);

  useEffect(() => {
    if (filteredConversations.length === 0) {
      setSelectedRentId(null);
      return;
    }

    if (suppressAutoSelectRef.current) {
      suppressAutoSelectRef.current = false;
      return;
    }

    const queryRentId = searchParams.get('rent_id');
    if (queryRentId && filteredConversations.some((conversation) => conversation.rentId === queryRentId)) {
      setSelectedRentId(queryRentId);
      return;
    }

    if (selectedRentId && filteredConversations.some((conversation) => conversation.rentId === selectedRentId)) {
      return;
    }

    setSelectedRentId(null);
  }, [filteredConversations, selectedRentId, searchParams]);

  const selectedConversation = useMemo(
    () => filteredConversations.find((conversation) => conversation.rentId === selectedRentId) ?? null,
    [filteredConversations, selectedRentId]
  );

  const handleSelectConversation = (rentId: string) => {
    setSelectedRentId(rentId);
    setIsSummaryOpen(!isMobile);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('rent_id', rentId);
      return next;
    });
  };

  const showConversation = Boolean(selectedConversation);

  const handleBackToList = () => {
    setSelectedRentId(null);
    setIsSummaryOpen(false);
    suppressAutoSelectRef.current = true;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('rent_id');
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-col gap-4 overflow-y-auto lg:overflow-hidden"
      style={availableHeight ? { height: `${availableHeight}px` } : undefined}
    >
      <DashboardSectionHeader
        title="Mensajes"
        description="Conversaciones de alquiler entre tienda y cliente."
        icon={MessageCircle}
      />

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-12">
        <div className={`${isMobile && showConversation ? 'hidden' : 'block'} min-h-0 h-full lg:block lg:col-span-4 xl:col-span-3 border rounded-lg overflow-hidden flex flex-col`}>
          <RentConversationList
            conversations={filteredConversations}
            selectedRentId={selectedRentId}
            isLoading={isLoading}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onSelect={handleSelectConversation}
          />
        </div>

        <div className={`${isMobile && !showConversation ? 'hidden' : 'block'} min-h-0 h-full lg:block lg:col-span-8 xl:col-span-6 border rounded-lg overflow-hidden flex flex-col`}>
          {selectedConversation ? (
            <>
              {isMobile && (
                <div className="border-b px-3 py-2">
                  <Button variant="ghost" size="sm" onClick={handleBackToList}>
                    Volver a conversaciones
                  </Button>
                </div>
              )}
              <RentConversationPanel
                rentId={selectedConversation.rentId}
                rental={selectedConversation.rental}
                viewerRole={selectedConversation.role}
                unreadCount={selectedConversation.unreadCount}
                isSummaryOpen={isSummaryOpen}
                onToggleSummary={() => setIsSummaryOpen((prev) => !prev)}
              />
            </>
          ) : (
            <div className="h-full min-h-40 flex items-center justify-center text-muted-foreground text-sm">
              Selecciona una conversación para empezar.
            </div>
          )}
        </div>

        <div className={`${isMobile || !selectedConversation || !isSummaryOpen ? 'hidden' : 'block'} h-full min-h-0 lg:block lg:col-span-12 xl:col-span-3`}>
          {selectedConversation && (
            <RentConversationSummary
              conversation={selectedConversation}
              onBackToConversation={() => setIsSummaryOpen(false)}
            />
          )}
        </div>
      </div>

      {isMobile && selectedConversation && isSummaryOpen && (
        <div className="min-h-[36dvh] rounded-lg border overflow-hidden">
          <RentConversationSummary
            conversation={selectedConversation}
            onBackToConversation={() => setIsSummaryOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MessagesDashboard;
