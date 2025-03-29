
import { CompanyUser } from '@/domain/models/CompanyUser';

// Mock users - would come from backend API in production
export const MOCK_USERS: CompanyUser[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'company_admin',
    status: 'active',
    dateAdded: '2023-05-15',
    companyId: '1'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'company_user',
    status: 'active',
    dateAdded: '2023-06-10',
    companyId: '1'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'company_user',
    status: 'active',
    dateAdded: '2023-06-22',
    companyId: '2'
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    role: 'company_user',
    status: 'invited',
    dateAdded: '2023-07-14',
    companyId: '2'
  },
  {
    id: '5',
    name: 'David Thompson',
    email: 'david@example.com',
    role: 'company_user',
    status: 'deactivated',
    dateAdded: '2023-06-05',
    companyId: '3'
  }
];
