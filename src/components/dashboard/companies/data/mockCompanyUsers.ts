
import { CompanyUser } from "@/domain/models/CompanyUser";

export const MOCK_COMPANY_USERS: CompanyUser[] = [
  {
    id: "cu1",
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    role: "company_admin",
    status: "active",
    dateAdded: "2024-01-10T09:00:00.000Z",
    companyId: "company-1",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: "cu2",
    name: "Carlos López",
    email: "carlos.lopez@example.com",
    role: "company_user",
    status: "active",
    dateAdded: "2024-01-15T10:30:00.000Z",
    companyId: "company-1",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: "cu3",
    name: "",
    email: "elena.moreno@example.com",
    role: "company_user",
    status: "pending",
    dateAdded: "2024-04-02T14:45:00.000Z",
    companyId: "company-1"
  },
  {
    id: "cu4",
    name: "Miguel Torres",
    email: "miguel.torres@example.com",
    role: "company_admin",
    status: "active",
    dateAdded: "2024-02-05T08:15:00.000Z",
    companyId: "company-2",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: "cu5",
    name: "Sofía García",
    email: "sofia.garcia@example.com",
    role: "company_user",
    status: "active",
    dateAdded: "2024-02-10T11:00:00.000Z",
    companyId: "company-2",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: "cu6",
    name: "",
    email: "javier.ruiz@example.com",
    role: "company_user",
    status: "expired",
    dateAdded: "2024-03-15T09:30:00.000Z",
    companyId: "company-2"
  },
  {
    id: "cu7",
    name: "Laura Santos",
    email: "laura.santos@example.com",
    role: "company_admin",
    status: "active",
    dateAdded: "2024-01-20T10:00:00.000Z",
    companyId: "company-3",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  }
];
