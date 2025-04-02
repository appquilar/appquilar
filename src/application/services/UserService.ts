
import { CompanyUser } from '@/domain/models/CompanyUser';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { MockUserRepository } from '@/infrastructure/repositories/MockUserRepository';

/**
 * Service for managing user data
 */
export class UserService {
  private static instance: UserService;
  private repository: UserRepository;

  private constructor(repository: UserRepository) {
    this.repository = repository;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      // Using the mock repository for now
      const repository = new MockUserRepository();
      UserService.instance = new UserService(repository);
    }
    return UserService.instance;
  }

  /**
   * Set a custom repository implementation
   */
  public static setRepository(repository: UserRepository): void {
    if (UserService.instance) {
      UserService.instance.repository = repository;
    } else {
      UserService.instance = new UserService(repository);
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<CompanyUser[]> {
    return this.repository.getAllUsers();
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<CompanyUser | null> {
    return this.repository.getUserById(id);
  }

  /**
   * Get users by company ID
   */
  async getUsersByCompanyId(companyId: string): Promise<CompanyUser[]> {
    return this.repository.getUsersByCompanyId(companyId);
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<CompanyUser>): Promise<CompanyUser> {
    return this.repository.createUser(userData);
  }

  /**
   * Update a user
   */
  async updateUser(id: string, userData: Partial<CompanyUser>): Promise<CompanyUser> {
    return this.repository.updateUser(id, userData);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<boolean> {
    return this.repository.deleteUser(id);
  }
}
