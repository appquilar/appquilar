
import { Category } from '@/domain/models/Category';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Herramientas Eléctricas',
    slug: 'herramientas-electricas',
    parentId: null,
    iconUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    headerImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    featuredImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Herramientas Manuales',
    slug: 'herramientas-manuales',
    parentId: null,
    iconUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    headerImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    featuredImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Equipo de Jardinería',
    slug: 'equipo-jardineria',
    parentId: null,
    iconUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    headerImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    featuredImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Taladros',
    slug: 'taladros',
    parentId: '1',
    iconUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    headerImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    featuredImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Sierras',
    slug: 'sierras',
    parentId: '1',
    iconUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    headerImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    featuredImageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];
