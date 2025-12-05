
import { User } from '@/domain/models/User.ts';

// Mock users - would come from backend API in production
export const MOCK_USERS: User[] = [
  {
    id: '1', 
    firstName: 'John Smith',
    email: 'john@example.com',
    role: 'company_admin',
    status: 'active',
    companyId: '1'
  },
  {
    id: '2',
    firstName: 'Sarah Johnson',
    email: 'sarah@example.com',
    roles: 'company_admin',
    status: 'active',
    companyId: '1'
  },
  {
    id: '3',
    firstName: 'Michael Brown',
    email: 'michael@example.com',
    role: 'company_user',
    status: 'active',
    dateAdded: '2023-06-22',
    companyId: '2'
  },
  {
    id: '4',
    firstName: 'Emily Wilson',
    email: 'emily@example.com',
    role: 'company_user',
    status: 'invited',
    dateAdded: '2023-07-14',
    companyId: '2'
  },
  {
    id: '5',
    firstName: 'David Thompson',
    email: 'david@example.com',
    role: 'company_user',
    status: 'deactivated',
    dateAdded: '2023-06-05',
    companyId: '3'
  }
];
