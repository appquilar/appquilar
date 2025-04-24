
import { CompanyUser, UserInvitationFormData } from '../models/CompanyUser';

/**
 * Repository interface for accessing and managing User data
 */
export interface IUserRepository {
  getAllUsers(): Promise<CompanyUser[]>;
  getUserById(id: string): Promise<CompanyUser | null>;
  getUsersByCompanyId(companyId: string): Promise<CompanyUser[]>;
  createUser(userData: UserInvitationFormData): Promise<CompanyUser>;
  updateUser(id: string, userData: Partial<CompanyUser>): Promise<CompanyUser>;
  deleteUser(id: string): Promise<boolean>;
}
