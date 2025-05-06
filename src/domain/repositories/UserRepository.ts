
import { CompanyUser, UserInvitationFormData } from '../models/CompanyUser';

/**
 * Repository interface for accessing and managing User data
 */
export interface IUserRepository {
  /**
   * Get all users
   */
  getAllUsers(): Promise<CompanyUser[]>;
  
  /**
   * Get a user by ID
   */
  getUserById(id: string): Promise<CompanyUser | null>;
  
  /**
   * Get users by company ID
   */
  getUsersByCompanyId(companyId: string): Promise<CompanyUser[]>;
  
  /**
   * Create a new user
   */
  createUser(userData: UserInvitationFormData): Promise<CompanyUser>;
  
  /**
   * Update a user
   */
  updateUser(id: string, userData: Partial<CompanyUser>): Promise<CompanyUser>;
  
  /**
   * Delete a user
   */
  deleteUser(id: string): Promise<boolean>;
}
