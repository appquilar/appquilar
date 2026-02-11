import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { rentalService } from '@/compositionRoot';
import { RentListParams } from '@/domain/repositories/RentalRepository';
import { Money } from '@/domain/models/Money';
import { useCurrentUser } from '@/application/hooks/useCurrentUser';

interface UseRentalsOptions {
  enabled?: boolean;
}

export const useRentals = (params: RentListParams = {}, options: UseRentalsOptions = {}) => {
  const enabled = options.enabled ?? true;

  const query = useQuery({
    queryKey: ['rents', params],
    queryFn: () => rentalService.listRents(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

  return {
    rentals: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    perPage: query.data?.perPage ?? params.perPage ?? 0,
    isLoading: query.isLoading,
    error: query.error ? 'Error al cargar alquileres' : null,
  };
};

interface UseOwnerRentalsCountParams {
  ownerId?: string | null;
}

export const useOwnerRentalsCount = ({
  ownerId,
}: UseOwnerRentalsCountParams) => {
  return useQuery({
    queryKey: ['rents', 'owner-count', ownerId],
    queryFn: async () => {
      if (!ownerId) {
        return 0;
      }

      const response = await rentalService.listRents({
        role: 'owner',
        ownerId,
        page: 1,
        perPage: 1,
      });

      return response.total ?? response.data.length;
    },
    enabled: Boolean(ownerId),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const toDateAtTime = (value: string, endOfDay: boolean): Date => {
    const [year, month, day] = value.split('-').map((part) => Number(part));
    return endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day, 0, 0, 0);
  };

  return useMutation({
    mutationFn: async ({
      productId,
      startDate,
      endDate,
      deposit,
      price,
      message,
      renterEmail,
      renterName,
    }: {
      productId: string;
      startDate: string;
      endDate: string;
      deposit: Money;
      price: Money;
      message: string;
      renterEmail?: string;
      renterName?: string;
    }) => {
      const rentId = uuidv4();
      const resolvedRenterEmail = (renterEmail ?? user?.email ?? '').trim();

      if (!resolvedRenterEmail) {
        throw new Error('renter_email_required');
      }

      await rentalService.createRent({
        rentId,
        productId,
        renterEmail: resolvedRenterEmail,
        renterName: renterName?.trim() || undefined,
        startDate: toDateAtTime(startDate, false),
        endDate: toDateAtTime(endDate, true),
        deposit,
        price,
        isLead: true,
      });

      const firstMessage = message.trim();
      if (firstMessage) {
        await rentalService.createRentMessage(rentId, { content: firstMessage });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rents'] });
    },
  });
};
