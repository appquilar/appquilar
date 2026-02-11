export type RentMessageSenderRole = 'owner' | 'renter' | 'system';

export interface RentalMessage {
  id: string;
  rentId: string;
  senderRole: RentMessageSenderRole;
  senderName: string;
  content: string;
  createdAt: Date;
  isMine: boolean;
}
