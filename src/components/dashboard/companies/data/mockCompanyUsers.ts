
import { User } from "@/domain/models/User.ts";

export const MOCK_COMPANY_USERS: User[] = [
  {
    id: "cu1",
    name: "Ana Martínez",
    email: "ana.martinez@protools.com",
    role: "company_admin",
    status: "active",
    dateAdded: "2024-01-10T09:00:00.000Z",
    companyId: "company-1",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: "cu2",
    name: "Carlos López",
    email: "carlos.lopez@protools.com",
    role: "company_user",
    status: "active",
    dateAdded: "2024-01-15T10:30:00.000Z",
    companyId: "company-1",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: "cu3",
    name: "Elena Moreno",
    email: "elena.moreno@protools.com",
    role: "company_user",
    status: "pending",
    dateAdded: "2024-04-02T14:45:00.000Z",
    companyId: "company-1"
  },
  {
    id: "cu4",
    name: "Roberto Fernández",
    email: "roberto.fernandez@protools.com",
    role: "company_user",
    status: "invited",
    dateAdded: "2024-04-15T11:20:00.000Z",
    companyId: "company-1"
  },
  {
    id: "cu5",
    name: "Lucía García",
    email: "lucia.garcia@protools.com",
    role: "company_admin",
    status: "active",
    dateAdded: "2024-02-20T09:15:00.000Z",
    companyId: "company-1",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  }
];

