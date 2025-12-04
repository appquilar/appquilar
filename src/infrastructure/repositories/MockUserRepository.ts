
import { User, UserInvitationFormData } from '@/domain/models/User.ts';
import { IUserRepository } from '@/domain/repositories/UserRepository';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_USERS } from '../services/mockData/userMockData';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [...MOCK_USERS];

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  async getUsersByCompanyId(companyId: string): Promise<User[]> {
    return this.users.filter(user => user.companyId === companyId);
  }

  async createUser(userData: UserInvitationFormData): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      name: '',
      email: userData.email,
      role: userData.role,
      status: 'invited',
      dateAdded: new Date().toISOString(),
      companyId: userData.companyId
    };
    
    this.users.push(newUser);
    return { ...newUser };
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    this.users[index] = {
      ...this.users[index],
      ...userData
    };

    return { ...this.users[index] };
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length !== initialLength;
  }
}
