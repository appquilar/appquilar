
import { CompanyUser } from '@/domain/models/CompanyUser';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { mockCompanyUsers } from '@/infrastructure/services/mockData/companyUserMockData';

/**
 * Mock implementation of the UserRepository interface
 */
export class MockUserRepository implements UserRepository {
  private users: CompanyUser[] = [...mockCompanyUsers];

  async getAllUsers(): Promise<CompanyUser[]> {
    return Promise.resolve([...this.users]);
  }

  async getUserById(id: string): Promise<CompanyUser | null> {
    const user = this.users.find(user => user.id === id);
    return Promise.resolve(user || null);
  }

  async getUsersByCompanyId(companyId: string): Promise<CompanyUser[]> {
    const filtered = this.users.filter(user => user.companyId === companyId);
    return Promise.resolve(filtered);
  }

  async createUser(userData: Partial<CompanyUser>): Promise<CompanyUser> {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData
    } as CompanyUser;
    
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  async updateUser(id: string, userData: Partial<CompanyUser>): Promise<CompanyUser> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = {
      ...this.users[index],
      ...userData
    };
    
    this.users[index] = updatedUser;
    return Promise.resolve(updatedUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return Promise.resolve(this.users.length !== initialLength);
  }
}
