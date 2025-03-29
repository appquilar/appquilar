
import { Site } from '@/domain/models/Site';

export const MOCK_SITES: Site[] = [
  {
    id: '1',
    name: 'Appquilar Principal',
    domain: 'appquilar.com',
    logo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    title: 'Appquilar - La plataforma de alquiler más grande',
    description: 'Encuentra todo lo que necesitas para alquilar en un solo lugar.',
    categoryIds: ['1', '2', '3'],
    primaryColor: '#4F46E5',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Herramientas Pro',
    domain: 'herramientas-pro.es',
    logo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    title: 'Herramientas Pro - Especialistas en alquiler de herramientas',
    description: 'La mejor selección de herramientas profesionales para alquilar.',
    categoryIds: ['1', '2'],
    primaryColor: '#F59E0B',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Jardín Express',
    domain: 'jardin-express.com',
    logo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    title: 'Jardín Express - Equipamiento para jardín',
    description: 'Alquila todo lo que necesitas para tu jardín.',
    categoryIds: ['3'],
    primaryColor: '#10B981',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];
