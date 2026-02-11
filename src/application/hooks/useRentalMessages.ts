import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalService } from '@/compositionRoot';
import { RentMessageListParams } from '@/domain/repositories/RentalRepository';
import { RentStatus } from '@/domain/models/Rental';

export const RENT_MESSAGES_KEY = 'rentMessages';
export const RENT_UNREAD_KEY = 'rentUnreadMessages';
export const RENT_CONVERSATIONS_KEY = 'rentConversations';

export const useRentalMessages = (
  rentId: string | undefined,
  params: RentMessageListParams = { page: 1, perPage: 200 },
  options: { pollingEnabled?: boolean } = {}
) => {
  const pollingEnabled = options.pollingEnabled ?? true;

  const query = useQuery({
    queryKey: [RENT_MESSAGES_KEY, rentId, params.page ?? 1, params.perPage ?? 200],
    queryFn: () => {
      if (!rentId) {
        return Promise.resolve({ data: [], total: 0, page: 1, perPage: 0 });
      }

      return rentalService.listRentMessages(rentId, params);
    },
    enabled: Boolean(rentId),
    refetchInterval: pollingEnabled ? 5000 : false,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });

  return {
    messages: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    perPage: query.data?.perPage ?? params.perPage ?? 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error ? 'Error al cargar los mensajes' : null,
  };
};

export const useCreateRentalMessage = (rentId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!rentId) {
        return;
      }

      await rentalService.createRentMessage(rentId, { content });
    },
    onSuccess: async () => {
      if (!rentId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [RENT_MESSAGES_KEY, rentId],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: [RENT_UNREAD_KEY],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: [RENT_CONVERSATIONS_KEY],
        exact: false,
      });
    },
  });
};

export const useMarkRentMessagesAsRead = (rentId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!rentId) {
        return;
      }

      await rentalService.markRentMessagesAsRead(rentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [RENT_UNREAD_KEY],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: [RENT_CONVERSATIONS_KEY],
        exact: false,
      });
    },
  });
};

export const useUnreadRentMessagesCount = () => {
  const query = useQuery({
    queryKey: [RENT_UNREAD_KEY],
    queryFn: () => rentalService.getUnreadRentMessagesCount(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });

  return {
    totalUnread: query.data?.totalUnread ?? 0,
    byRent: query.data?.byRent ?? [],
    isLoading: query.isLoading,
    error: query.error ? 'Error al cargar no leidos' : null,
    refetch: query.refetch,
  };
};

export const useUnreadCountForRent = (rentId: string | undefined): number => {
  const { byRent } = useUnreadRentMessagesCount();

  if (!rentId) {
    return 0;
  }

  const item = byRent.find((entry) => entry.rentId === rentId);
  return item?.unreadCount ?? 0;
};

export const useUnreadCountMap = (): Record<string, number> => {
  const { byRent } = useUnreadRentMessagesCount();

  return byRent.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.rentId] = entry.unreadCount;
    return acc;
  }, {});
};

export const useUpdateRentStatusFromMessages = (rentId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { status: RentStatus; proposalValidUntil?: Date | null }) => {
      if (!rentId) {
        return;
      }

      await rentalService.updateRentStatus(rentId, {
        status: input.status,
        proposalValidUntil: input.proposalValidUntil ?? null,
      });
    },
    onSuccess: async () => {
      if (!rentId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [RENT_MESSAGES_KEY, rentId],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: [RENT_CONVERSATIONS_KEY],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: [RENT_UNREAD_KEY],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: ['rents'],
        exact: false,
      });

      await queryClient.invalidateQueries({
        queryKey: ['rent', rentId],
      });
    },
  });
};
