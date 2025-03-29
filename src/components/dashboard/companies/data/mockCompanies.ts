
import { Company } from '@/domain/models/Company';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Pro Tools Inc.',
    description: 'Empresa especializada en alquiler de herramientas profesionales.',
    slug: 'pro-tools-inc',
    fiscalId: 'B12345678',
    address: 'Calle Industria, 123, Madrid',
    contactEmail: 'info@protools.com',
    contactPhone: '+34 911 234 567',
    categoryIds: ['1', '2'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Garden Rentals',
    description: 'Todo el equipamiento para jardín que necesitas.',
    slug: 'garden-rentals',
    fiscalId: 'B87654321',
    address: 'Avenida del Parque, 45, Barcelona',
    contactEmail: 'contacto@gardenrentals.com',
    contactPhone: '+34 933 456 789',
    categoryIds: ['3'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Construction Gear',
    description: 'Especialistas en equipamiento para construcción.',
    slug: 'construction-gear',
    fiscalId: 'B55555555',
    address: 'Calle Constructor, 78, Valencia',
    contactEmail: 'info@constructiongear.com',
    contactPhone: '+34 966 789 123',
    categoryIds: ['1', '2'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];
