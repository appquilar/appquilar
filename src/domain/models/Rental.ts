import { Money } from './Money';

export type RentStatus =
  | 'lead_pending'
  | 'proposal_pending_renter'
  | 'rental_confirmed'
  | 'rental_active'
  | 'rental_completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';
export type RentOwnerType = 'user' | 'company';

export interface RentalOwnerLocation {
  street?: string | null;
  street2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface Rental {
  id: string;
  productId: string;
  productName?: string | null;
  productSlug?: string | null;
  productInternalId?: string | null;
  ownerId: string;
  ownerName?: string | null;
  ownerType: RentOwnerType;
  renterId: string | null;
  renterName?: string | null;
  renterEmail?: string | null;
  ownerLocation?: RentalOwnerLocation | null;
  startDate: Date;
  endDate: Date;
  deposit: Money;
  price: Money;
  depositReturned?: Money | null;
  status: RentStatus;
  isLead: boolean;
  proposalValidUntil?: Date | null;
  ownerProposalAccepted?: boolean;
  renterProposalAccepted?: boolean;
}

export type RentalStatus = RentStatus;
