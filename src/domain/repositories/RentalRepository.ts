import { Rental, RentStatus } from '@/domain/models/Rental';
import { Money } from '@/domain/models/Money';
import { RentalMessage } from '@/domain/models/RentalMessage';

export type RentTimeline = 'upcoming' | 'past';
export type RentRole = 'owner' | 'renter';

export interface RentListParams {
  productId?: string;
  search?: string;
  statusGroup?: 'pending' | 'cancelled' | 'completed';
  startDate?: Date;
  endDate?: Date;
  status?: RentStatus;
  isLead?: boolean;
  timeline?: RentTimeline;
  role?: RentRole;
  ownerId?: string;
  page?: number;
  perPage?: number;
}

export interface RentListResponse {
  data: Rental[];
  total: number;
  page: number;
  perPage: number;
}

export interface RentMessageListParams {
  page?: number;
  perPage?: number;
}

export interface RentMessageListResponse {
  data: RentalMessage[];
  total: number;
  page: number;
  perPage: number;
}

export interface RentUnreadByRent {
  rentId: string;
  unreadCount: number;
}

export interface RentUnreadMessagesCount {
  totalUnread: number;
  byRent: RentUnreadByRent[];
}

export interface CreateRentData {
  rentId: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  deposit: Money;
  price: Money;
  renterEmail: string;
  renterName?: string | null;
  isLead?: boolean;
}

export interface UpdateRentData {
  startDate?: Date | null;
  endDate?: Date | null;
  deposit?: Money | null;
  price?: Money | null;
  depositReturned?: Money | null;
  proposalValidUntil?: Date | null;
  status?: RentStatus | null;
}

export interface UpdateRentStatusData {
  status: RentStatus;
  proposalValidUntil?: Date | null;
}

export interface CreateRentMessageData {
  content: string;
}

export interface RentalRepository {
  listRents(params?: RentListParams): Promise<RentListResponse>;
  getRentById(id: string): Promise<Rental | null>;
  listRentMessages(rentId: string, params?: RentMessageListParams): Promise<RentMessageListResponse>;
  createRentMessage(rentId: string, data: CreateRentMessageData): Promise<void>;
  markRentMessagesAsRead(rentId: string): Promise<void>;
  getUnreadRentMessagesCount(): Promise<RentUnreadMessagesCount>;
  createRent(data: CreateRentData): Promise<void>;
  updateRent(id: string, data: UpdateRentData): Promise<void>;
  updateRentStatus(id: string, data: UpdateRentStatusData): Promise<void>;
}
