
import { CompanyUser, UserInvitationFormData } from '@/domain/models/CompanyUser';
import { IUserRepository } from '@/domain/repositories/UserRepository';
import { MockUserRepository } from '@/infrastructure/repositories/MockUserRepository';

export class UserService {
  private static instance: UserService;
  private repository: IUserRepository;

  private constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      const repository = new MockUserRepository();
      UserService.instance = new UserService(repository);
    }
    return UserService.instance;
  }

  async getAllUsers(): Promise<CompanyUser[]> {
    return this.repository.getAllUsers();
  }

  async getUserById(id: string): Promise<CompanyUser | null> {
    return this.repository.getUserById(id);
  }

  async getUsersByCompanyId(companyId: string): Promise<CompanyUser[]> {
    return this.repository.getUsersByCompanyId(companyId);
  }

  async createUser(userData: UserInvitationFormData): Promise<CompanyUser> {
    return this.repository.createUser(userData);
  }

  async updateUser(id: string, userData: Partial<CompanyUser>): Promise<CompanyUser> {
    return this.repository.updateUser(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repository.deleteUser(id);
  }
}
