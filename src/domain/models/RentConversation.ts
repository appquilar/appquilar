import { Rental } from '@/domain/models/Rental';

export type RentConversationRole = 'owner' | 'renter';

export interface RentConversation {
  rentId: string;
  role: RentConversationRole;
  unreadCount: number;
  productName: string;
  counterpartName: string;
  lastMessageAt: Date | null;
  rental: Rental;
}
