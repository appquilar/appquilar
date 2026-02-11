import { Rental } from '@/domain/models/Rental';
import { RentalMessage } from '@/domain/models/RentalMessage';
import {
  RentalRepository,
  RentListParams,
  RentListResponse,
  RentMessageListParams,
  RentMessageListResponse,
  RentUnreadMessagesCount,
  CreateRentData,
  CreateRentMessageData,
  UpdateRentData,
  UpdateRentStatusData
} from '@/domain/repositories/RentalRepository';
import { MOCK_RENTALS } from '@/infrastructure/adapters/mockData/rentals/mockRentalsData';

export class MockRentalRepository implements RentalRepository {
  private rentals: Rental[] = MOCK_RENTALS;
  private messagesByRentId: Record<string, RentalMessage[]> = {};
  private lastReadAtByRentId: Record<string, Date> = {};

  async listRents(params: RentListParams = {}): Promise<RentListResponse> {
    let filtered = [...this.rentals];

    if (params.productId) {
      filtered = filtered.filter((rental) => rental.productId === params.productId);
    }

    if (params.status) {
      filtered = filtered.filter((rental) => rental.status === params.status);
    }

    if (params.isLead !== undefined) {
      filtered = filtered.filter((rental) => rental.isLead === params.isLead);
    }

    if (params.timeline === 'upcoming') {
      filtered = filtered.filter((rental) => !rental.isLead && rental.endDate >= new Date());
    }

    if (params.timeline === 'past') {
      filtered = filtered.filter((rental) => !rental.isLead && rental.endDate < new Date());
    }

    if (params.role === 'renter') {
      filtered = filtered.filter((rental) => rental.renterId === params.ownerId);
    }

    if (params.role !== 'renter' && params.ownerId) {
      filtered = filtered.filter((rental) => rental.ownerId === params.ownerId);
    }

    if (params.startDate) {
      filtered = filtered.filter((rental) => rental.endDate >= params.startDate!);
    }

    if (params.endDate) {
      filtered = filtered.filter((rental) => rental.startDate <= params.endDate!);
    }

    return {
      data: filtered,
      total: filtered.length,
      page: params.page ?? 1,
      perPage: params.perPage ?? filtered.length,
    };
  }

  async getRentById(id: string): Promise<Rental | null> {
    const rental = this.rentals.find((rental) => rental.id === id);
    return Promise.resolve(rental ?? null);
  }

  async listRentMessages(
    rentId: string,
    params: RentMessageListParams = {}
  ): Promise<RentMessageListResponse> {
    const messages = this.messagesByRentId[rentId] ?? [];
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const start = (page - 1) * perPage;
    const data = messages.slice(start, start + perPage);

    return {
      data,
      total: messages.length,
      page,
      perPage,
    };
  }

  async createRentMessage(rentId: string, data: CreateRentMessageData): Promise<void> {
    const list = this.messagesByRentId[rentId] ?? [];

    list.push({
      id: `${rentId}-${list.length + 1}`,
      rentId,
      senderRole: 'owner',
      senderName: 'Usuario demo',
      content: data.content,
      createdAt: new Date(),
      isMine: true,
    });

    this.messagesByRentId[rentId] = list;
  }

  async markRentMessagesAsRead(rentId: string): Promise<void> {
    this.lastReadAtByRentId[rentId] = new Date();
  }

  async getUnreadRentMessagesCount(): Promise<RentUnreadMessagesCount> {
    const byRent = Object.entries(this.messagesByRentId).map(([rentId, messages]) => {
      const lastReadAt = this.lastReadAtByRentId[rentId];
      const unreadCount = messages.filter((message) => {
        if (message.isMine) {
          return false;
        }

        if (!lastReadAt) {
          return true;
        }

        return message.createdAt > lastReadAt;
      }).length;

      return { rentId, unreadCount };
    }).filter((item) => item.unreadCount > 0);

    const totalUnread = byRent.reduce((total, item) => total + item.unreadCount, 0);

    return {
      totalUnread,
      byRent,
    };
  }

  async createRent(data: CreateRentData): Promise<void> {
    this.rentals = [
      {
        id: data.rentId,
        productId: data.productId,
        productName: 'Producto',
        ownerId: 'mock-owner',
        ownerName: 'Tienda demo',
        ownerType: 'user',
        renterId: data.renterEmail ? 'mock-renter' : null,
        renterName: data.renterName || data.renterEmail || 'Cliente externo',
        renterEmail: data.renterEmail,
        ownerLocation: {
          label: 'Ubicacion no disponible',
        },
        startDate: data.startDate,
        endDate: data.endDate,
        deposit: data.deposit,
        price: data.price,
        depositReturned: null,
        status: data.isLead ? 'lead_pending' : 'rental_confirmed',
        isLead: data.isLead ?? false,
        proposalValidUntil: null,
      },
      ...this.rentals,
    ];
  }

  async updateRent(id: string, data: UpdateRentData): Promise<void> {
    this.rentals = this.rentals.map((rental) => {
      if (rental.id !== id) {
        return rental;
      }

      return {
        ...rental,
        startDate: data.startDate ?? rental.startDate,
        endDate: data.endDate ?? rental.endDate,
        deposit: data.deposit ?? rental.deposit,
        price: data.price ?? rental.price,
        depositReturned: data.depositReturned ?? rental.depositReturned,
        proposalValidUntil: data.proposalValidUntil ?? rental.proposalValidUntil,
        status: data.status ?? rental.status,
      };
    });
  }

  async updateRentStatus(id: string, data: UpdateRentStatusData): Promise<void> {
    await this.updateRent(id, { status: data.status });
  }
}
