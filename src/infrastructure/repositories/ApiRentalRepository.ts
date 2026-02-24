import { ApiClient } from '@/infrastructure/http/ApiClient';
import { AuthSession } from '@/domain/models/AuthSession';
import {
  CreateRentMessageData,
  CreateRentData,
  RentListParams,
  RentMessageListParams,
  RentMessageListResponse,
  RentUnreadMessagesCount,
  RentListResponse,
  RentalRepository,
  UpdateRentData,
  UpdateRentStatusData
} from '@/domain/repositories/RentalRepository';
import { Rental, RentOwnerType, RentStatus } from '@/domain/models/Rental';
import { Money } from '@/domain/models/Money';
import { RentalMessage } from '@/domain/models/RentalMessage';

interface RentDto {
  rent_id: string;
  product_id: string;
  product_name?: string | null;
  product_slug?: string | null;
  product_internal_id?: string | null;
  owner_id: string;
  owner_type: string;
  owner_name?: string | null;
  renter_id: string | null;
  renter_name?: string | null;
  renter_email?: string | null;
  owner_location?: {
    street?: string | null;
    street2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    state?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    label?: string | null;
  } | null;
  start_date: string;
  end_date: string;
  deposit: Money;
  price: Money;
  deposit_returned?: Money | null;
  status: RentStatus;
  is_lead?: boolean;
  proposal_valid_until?: string | null;
  owner_proposal_accepted?: boolean;
  renter_proposal_accepted?: boolean;
}

interface RentListResponseDto {
  data: RentDto[];
  total: number;
  page: number;
  per_page: number;
}

interface RentMessageDto {
  message_id: string;
  rent_id: string;
  sender_role: 'owner' | 'renter' | 'system';
  sender_name: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

interface RentMessageListResponseDto {
  data: RentMessageDto[];
  total: number;
  page: number;
  per_page: number;
}

interface RentUnreadByRentDto {
  rent_id: string;
  unread_count: number;
}

interface RentUnreadMessagesCountDto {
  total_unread: number;
  by_rent: RentUnreadByRentDto[];
}

export class ApiRentalRepository implements RentalRepository {
  private client: ApiClient;
  private getSession: () => AuthSession | null;

  constructor(client: ApiClient, getSession: () => AuthSession | null) {
    this.client = client;
    this.getSession = getSession;
  }

  private getAuthHeaders(): Record<string, string> {
    const session = this.getSession();
    if (session?.token) {
      return { Authorization: `Bearer ${session.token}` };
    }
    return {};
  }

  private formatApiDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private parseApiDate(value: string, endOfDay: boolean = false): Date {
    const datePart = value.trim().split(' ')[0] ?? '';
    const parts = datePart.split('-').map(Number);
    if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
      const [year, month, day] = parts;
      if (endOfDay) {
        return new Date(year, month - 1, day, 23, 59, 59);
      }

      return new Date(year, month - 1, day, 0, 0, 0);
    }

    const fallback = new Date(value);
    if (!Number.isNaN(fallback.getTime())) {
      if (endOfDay) {
        fallback.setHours(23, 59, 59, 0);
      } else {
        fallback.setHours(0, 0, 0, 0);
      }

      return fallback;
    }

    return new Date();
  }

  private parseApiDateTime(value: string): Date {
    const parts = value.split(' ');
    if (parts.length >= 2) {
      const [year, month, day] = parts[0].split('-').map(Number);
      const [hour, minute, second] = parts[1].split(':').map(Number);
      if ([year, month, day, hour, minute, second].every((part) => !Number.isNaN(part))) {
        return new Date(year, month - 1, day, hour, minute, second);
      }
    }

    const fallback = new Date(value);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }

    return new Date();
  }

  private mapToDomain(dto: RentDto): Rental {
    const ownerType = String(dto.owner_type).toLowerCase() === 'company' ? 'company' : 'user';

    return {
      id: dto.rent_id,
      productId: dto.product_id,
      productName: dto.product_name ?? null,
      productSlug: dto.product_slug ?? null,
      productInternalId: dto.product_internal_id ?? null,
      ownerId: dto.owner_id,
      ownerType: ownerType as RentOwnerType,
      ownerName: dto.owner_name ?? null,
      renterId: dto.renter_id,
      renterName: dto.renter_name ?? null,
      renterEmail: dto.renter_email ?? null,
      ownerLocation: dto.owner_location
        ? {
            street: dto.owner_location.street ?? null,
            street2: dto.owner_location.street2 ?? null,
            city: dto.owner_location.city ?? null,
            postalCode: dto.owner_location.postal_code ?? null,
            state: dto.owner_location.state ?? null,
            country: dto.owner_location.country ?? null,
            latitude: dto.owner_location.latitude ?? null,
            longitude: dto.owner_location.longitude ?? null,
            label: dto.owner_location.label ?? null,
          }
        : null,
      startDate: this.parseApiDate(dto.start_date, false),
      endDate: this.parseApiDate(dto.end_date, true),
      deposit: dto.deposit,
      price: dto.price,
      depositReturned: dto.deposit_returned ?? null,
      status: dto.status,
      isLead: dto.is_lead ?? false,
      proposalValidUntil: dto.proposal_valid_until ? this.parseApiDate(dto.proposal_valid_until, true) : null,
      ownerProposalAccepted: dto.owner_proposal_accepted ?? false,
      renterProposalAccepted: dto.renter_proposal_accepted ?? false,
    };
  }

  private mapMessageToDomain(dto: RentMessageDto): RentalMessage {
    return {
      id: dto.message_id,
      rentId: dto.rent_id,
      senderRole: dto.sender_role,
      senderName: dto.sender_name,
      content: dto.content,
      createdAt: this.parseApiDateTime(dto.created_at),
      isMine: dto.is_mine,
    };
  }

  async listRents(params: RentListParams = {}): Promise<RentListResponse> {
    const queryParams = new URLSearchParams();

    if (params.productId) queryParams.append('product_id', params.productId);
    if (params.search) queryParams.append('search', params.search);
    if (params.statusGroup) queryParams.append('status_group', params.statusGroup);
    if (params.startDate) queryParams.append('start_date', this.formatApiDate(params.startDate));
    if (params.endDate) queryParams.append('end_date', this.formatApiDate(params.endDate));
    if (params.status) queryParams.append('status', params.status);
    if (params.isLead !== undefined) queryParams.append('is_lead', params.isLead ? 'true' : 'false');
    if (params.timeline) queryParams.append('timeline', params.timeline);
    if (params.role) queryParams.append('role', params.role);
    if (params.ownerId) queryParams.append('owner_id', params.ownerId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.perPage) queryParams.append('per_page', params.perPage.toString());

    const querySuffix = queryParams.toString();
    const response = await this.client.get<RentListResponseDto>(
      `/api/rents${querySuffix ? `?${querySuffix}` : ''}`,
      { headers: this.getAuthHeaders() }
    );

    let payload: any = response;

    if (payload?.data && Array.isArray(payload.data)) {
      // already in RentListResponse shape
    } else if (payload?.data?.data && Array.isArray(payload.data.data)) {
      payload = payload.data;
    }

    const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

    return {
      data: items.map((item) => this.mapToDomain(item)),
      total: payload.total ?? items.length,
      page: payload.page ?? 1,
      perPage: payload.per_page ?? params.perPage ?? items.length,
    };
  }

  async getRentById(id: string): Promise<Rental | null> {
    try {
      const response = await this.client.get<RentDto>(`/api/rents/${id}`, {
        headers: this.getAuthHeaders(),
      });
      const payload = (response as any).data ? (response as any).data : response;
      return this.mapToDomain(payload);
    } catch (error) {
      console.error(`Error fetching rent ${id}`, error);
      return null;
    }
  }

  async listRentMessages(
    rentId: string,
    params: RentMessageListParams = {}
  ): Promise<RentMessageListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.perPage) queryParams.append('per_page', params.perPage.toString());

    const querySuffix = queryParams.toString();
    const response = await this.client.get<RentMessageListResponseDto>(
      `/api/rents/${rentId}/messages${querySuffix ? `?${querySuffix}` : ''}`,
      { headers: this.getAuthHeaders() }
    );

    let payload: any = response;

    if (payload?.data && Array.isArray(payload.data)) {
      // already in list response shape
    } else if (payload?.data?.data && Array.isArray(payload.data.data)) {
      payload = payload.data;
    }

    const items = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

    return {
      data: items.map((item) => this.mapMessageToDomain(item)),
      total: payload.total ?? items.length,
      page: payload.page ?? 1,
      perPage: payload.per_page ?? params.perPage ?? items.length,
    };
  }

  async createRentMessage(rentId: string, data: CreateRentMessageData): Promise<void> {
    await this.client.post<void>(
      `/api/rents/${rentId}/messages`,
      { content: data.content },
      {
        headers: this.getAuthHeaders(),
        skipParseJson: true,
      }
    );
  }

  async markRentMessagesAsRead(rentId: string): Promise<void> {
    await this.client.post<void>(
      `/api/rents/${rentId}/messages/read`,
      undefined,
      {
        headers: this.getAuthHeaders(),
        skipParseJson: true,
      }
    );
  }

  async getUnreadRentMessagesCount(): Promise<RentUnreadMessagesCount> {
    const response = await this.client.get<RentUnreadMessagesCountDto>(
      '/api/rents/messages/unread-count',
      { headers: this.getAuthHeaders() }
    );

    const payload = (response as any).data ? (response as any).data : response;

    const byRent = Array.isArray(payload.by_rent) ? payload.by_rent : [];

    return {
      totalUnread: payload.total_unread ?? 0,
      byRent: byRent.map((item: RentUnreadByRentDto) => ({
        rentId: item.rent_id,
        unreadCount: item.unread_count,
      })),
    };
  }

  async createRent(data: CreateRentData): Promise<void> {
    const dto = {
      rent_id: data.rentId,
      product_id: data.productId,
      start_date: this.formatApiDate(data.startDate),
      end_date: this.formatApiDate(data.endDate),
      deposit: data.deposit,
      price: data.price,
      renter_email: data.renterEmail,
      renter_name: data.renterName ?? null,
      is_lead: data.isLead ?? false,
    };

    await this.client.post<void>('/api/rents', dto, {
      headers: this.getAuthHeaders(),
      skipParseJson: true,
    });
  }

  async updateRent(id: string, data: UpdateRentData): Promise<void> {
    const dto: Record<string, unknown> = {};

    if (data.startDate !== undefined) {
      dto.start_date = data.startDate ? this.formatApiDate(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      dto.end_date = data.endDate ? this.formatApiDate(data.endDate) : null;
    }
    if (data.deposit !== undefined) {
      dto.deposit = data.deposit;
    }
    if (data.price !== undefined) {
      dto.price = data.price;
    }
    if (data.depositReturned !== undefined) {
      dto.deposit_returned = data.depositReturned;
    }
    if (data.status !== undefined) {
      dto.status = data.status;
    }
    if (data.proposalValidUntil !== undefined) {
      dto.proposal_valid_until = data.proposalValidUntil
        ? this.formatApiDate(data.proposalValidUntil)
        : null;
    }

    await this.client.patch<void>(`/api/rents/${id}`, dto, {
      headers: this.getAuthHeaders(),
      skipParseJson: true,
    });
  }

  async updateRentStatus(id: string, data: UpdateRentStatusData): Promise<void> {
    const dto: Record<string, unknown> = {
      rent_status: data.status,
    };

    if (data.proposalValidUntil !== undefined) {
      dto.proposal_valid_until = data.proposalValidUntil
        ? this.formatApiDate(data.proposalValidUntil)
        : null;
    }

    await this.client.patch<void>(`/api/rents/${id}/status`, dto, {
      headers: this.getAuthHeaders(),
      skipParseJson: true,
    });
  }
}
