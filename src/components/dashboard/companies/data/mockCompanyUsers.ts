
import { CompanyUser } from '@/domain/models/CompanyUser';

export const MOCK_COMPANY_USERS: CompanyUser[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@protools.com',
    role: 'company_admin',
    status: 'accepted',
    dateAdded: '2023-01-01T00:00:00Z',
    companyId: '1'
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@protools.com',
    role: 'company_user',
    status: 'accepted',
    dateAdded: '2023-01-15T00:00:00Z',
    companyId: '1'
  },
  {
    id: '3',
    name: 'Pedro Rodríguez',
    email: 'pedro@protools.com',
    role: 'company_user',
    status: 'pending',
    dateAdded: '2023-02-01T00:00:00Z',
    companyId: '1'
  },
  {
    id: '4',
    name: 'Ana García',
    email: 'ana@gardenrentals.com',
    role: 'company_admin',
    status: 'accepted',
    dateAdded: '2023-01-01T00:00:00Z',
    companyId: '2'
  },
  {
    id: '5',
    name: 'Carlos Martínez',
    email: 'carlos@constructiongear.com',
    role: 'company_admin',
    status: 'accepted',
    dateAdded: '2023-01-01T00:00:00Z',
    companyId: '3'
  },
  {
    id: '6',
    name: 'Lucía Fernández',
    email: 'lucia@constructiongear.com',
    role: 'company_user',
    status: 'expired',
    dateAdded: '2023-01-15T00:00:00Z',
    companyId: '3'
  }
];
