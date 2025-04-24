
import { CompanyUser } from '@/domain/models/CompanyUser';

export const MOCK_USERS: CompanyUser[] = [
  {
    id: "user-1",
    name: "Ana Martínez",
    email: "ana.martinez@protools.com",
    role: "company_admin",
    status: "active",
    dateAdded: "2024-01-15T10:30:00.000Z",
    companyId: "1", // Updated to match first company ID
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    id: "user-2",
    name: "Carlos López",
    email: "carlos.lopez@protools.com",
    role: "company_user",
    status: "active",
    dateAdded: "2024-02-20T14:45:00.000Z",
    companyId: "1"
  },
  {
    id: "user-3",
    email: "maria.garcia@protools.com",
    name: "",
    role: "company_user",
    status: "invited",
    dateAdded: "2024-04-01T09:15:00.000Z",
    companyId: "1"
  }
];
