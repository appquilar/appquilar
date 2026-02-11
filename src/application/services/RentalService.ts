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
import { Rental } from '@/domain/models/Rental';

export class RentalService {
  private repository: RentalRepository;

  constructor(repository: RentalRepository) {
    this.repository = repository;
  }

  listRents(params?: RentListParams): Promise<RentListResponse> {
    return this.repository.listRents(params);
  }

  getRentById(id: string): Promise<Rental | null> {
    return this.repository.getRentById(id);
  }

  listRentMessages(rentId: string, params?: RentMessageListParams): Promise<RentMessageListResponse> {
    return this.repository.listRentMessages(rentId, params);
  }

  createRentMessage(rentId: string, data: CreateRentMessageData): Promise<void> {
    return this.repository.createRentMessage(rentId, data);
  }

  markRentMessagesAsRead(rentId: string): Promise<void> {
    return this.repository.markRentMessagesAsRead(rentId);
  }

  getUnreadRentMessagesCount(): Promise<RentUnreadMessagesCount> {
    return this.repository.getUnreadRentMessagesCount();
  }

  createRent(data: CreateRentData): Promise<void> {
    return this.repository.createRent(data);
  }

  updateRent(id: string, data: UpdateRentData): Promise<void> {
    return this.repository.updateRent(id, data);
  }

  updateRentStatus(id: string, data: UpdateRentStatusData): Promise<void> {
    return this.repository.updateRentStatus(id, data);
  }
}
