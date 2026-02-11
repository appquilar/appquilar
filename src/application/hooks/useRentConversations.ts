import { useQuery } from '@tanstack/react-query';
import { rentalService } from '@/compositionRoot';
import { useCurrentUser } from '@/application/hooks/useCurrentUser';
import { RentConversation } from '@/domain/models/RentConversation';
import { Rental, RentStatus } from '@/domain/models/Rental';
import { RENT_CONVERSATIONS_KEY, useUnreadRentMessagesCount } from '@/application/hooks/useRentalMessages';

const normalizeProductName = (rental: Rental): string => rental.productName ?? 'Producto sin nombre';
const UNREAD_EXCLUDED_STATUSES: RentStatus[] = ['cancelled', 'rental_completed'];

const resolveUnreadCount = (rental: Rental, unreadByRent: Record<string, number>): number => {
  if (UNREAD_EXCLUDED_STATUSES.includes(rental.status)) {
    return 0;
  }

  return unreadByRent[rental.id] ?? 0;
};

const resolveCounterpartName = (rental: Rental, role: 'owner' | 'renter'): string => {
  if (role === 'owner') {
    return rental.renterName ?? 'Cliente sin nombre';
  }

  return rental.ownerName ?? 'Tienda sin nombre';
};

const sortConversations = (items: RentConversation[]): RentConversation[] => {
  return [...items].sort((a, b) => {
    const aDate = a.lastMessageAt?.getTime() ?? Math.max(a.rental.endDate.getTime(), a.rental.startDate.getTime());
    const bDate = b.lastMessageAt?.getTime() ?? Math.max(b.rental.endDate.getTime(), b.rental.startDate.getTime());

    if (aDate !== bDate) {
      return bDate - aDate;
    }

    return b.unreadCount - a.unreadCount;
  });
};

export const useRentConversations = () => {
  const { user } = useCurrentUser();
  const unread = useUnreadRentMessagesCount();

  const query = useQuery({
    queryKey: [RENT_CONVERSATIONS_KEY, user?.id, user?.companyId, unread.byRent],
    queryFn: async (): Promise<RentConversation[]> => {
      if (!user) {
        return [];
      }

      const ownerId = user.companyId ?? user.id;

      const [ownerRents, renterRents] = await Promise.all([
        rentalService.listRents({
          role: 'owner',
          ownerId,
          page: 1,
          perPage: 200,
        }),
        rentalService.listRents({
          role: 'renter',
          page: 1,
          perPage: 200,
        }),
      ]);

      const unreadByRent = unread.byRent.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.rentId] = entry.unreadCount;
        return acc;
      }, {});

      const map = new Map<string, RentConversation>();

      ownerRents.data.forEach((rental) => {
        map.set(rental.id, {
          rentId: rental.id,
          role: 'owner',
          unreadCount: resolveUnreadCount(rental, unreadByRent),
          productName: normalizeProductName(rental),
          counterpartName: resolveCounterpartName(rental, 'owner'),
          lastMessageAt: null,
          rental,
        });
      });

      renterRents.data.forEach((rental) => {
        if (map.has(rental.id)) {
          const existing = map.get(rental.id);

          if (existing) {
            map.set(rental.id, {
              ...existing,
              unreadCount: Math.max(existing.unreadCount, resolveUnreadCount(rental, unreadByRent)),
            });
          }

          return;
        }

        map.set(rental.id, {
          rentId: rental.id,
          role: 'renter',
          unreadCount: resolveUnreadCount(rental, unreadByRent),
          productName: normalizeProductName(rental),
          counterpartName: resolveCounterpartName(rental, 'renter'),
          lastMessageAt: null,
          rental,
        });
      });

      const withLastMessageAt = await Promise.all(
        Array.from(map.values()).map(async (conversation) => {
          try {
            const firstPage = await rentalService.listRentMessages(conversation.rentId, {
              page: 1,
              perPage: 1,
            });

            if (firstPage.total <= 0) {
              return {
                ...conversation,
                lastMessageAt: null,
              };
            }

            if (firstPage.total === 1) {
              return {
                ...conversation,
                lastMessageAt: firstPage.data[0]?.createdAt ?? null,
              };
            }

            const lastPage = await rentalService.listRentMessages(conversation.rentId, {
              page: firstPage.total,
              perPage: 1,
            });
            const latestMessage = lastPage.data[lastPage.data.length - 1] ?? null;

            return {
              ...conversation,
              lastMessageAt: latestMessage?.createdAt ?? null,
            };
          } catch (_error) {
            return conversation;
          }
        })
      );

      return sortConversations(withLastMessageAt);
    },
    enabled: Boolean(user),
    placeholderData: (previousData) => previousData,
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? 'Error al cargar conversaciones' : null,
    totalUnread: unread.totalUnread,
    unreadMap: unread.byRent.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.rentId] = entry.unreadCount;
      return acc;
    }, {}),
  };
};
