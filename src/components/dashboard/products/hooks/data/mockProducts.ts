
import { Product } from '@/components/products/ProductCard';

// Productos de ejemplo - vendrían de una API backend en producción
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    internalId: 'PRD001',
    name: 'Taladro Percutor Profesional 20V',
    slug: 'professional-hammer-drill-20v',
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    description: 'Taladro percutor de alta potencia perfecto para trabajos en concreto y mampostería. Incluye batería, cargador y estuche de transporte.',
    price: {
      hourly: 8,
      daily: 25,
      weekly: 120,
      monthly: 350
    },
    company: {
      id: '1',
      name: 'Pro Tools Inc.',
      slug: 'pro-tools-inc'
    },
    category: {
      id: '1',
      name: 'Herramientas Eléctricas',
      slug: 'power-tools'
    },
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: '2',
    internalId: 'PRD002',
    name: 'Sierra de Mesa con Soporte',
    slug: 'table-saw-with-stand',
    imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    description: 'Sierra de mesa portátil con soporte plegable. Ideal para obras y proyectos DIY.',
    price: {
      daily: 35,
      weekly: 160,
      monthly: 450
    },
    company: {
      id: '1',
      name: 'Pro Tools Inc.',
      slug: 'pro-tools-inc'
    },
    category: {
      id: '1',
      name: 'Herramientas Eléctricas',
      slug: 'power-tools'
    },
    rating: 4.6,
    reviewCount: 89
  },
  {
    id: '3',
    internalId: 'PRD003',
    name: 'Set de Herramientas de Jardinería',
    slug: 'landscaping-tool-set',
    imageUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    description: 'Conjunto completo de herramientas de jardinería incluyendo rastrillo, pala, podadoras y más.',
    price: {
      daily: 20,
      weekly: 90,
      monthly: 280
    },
    company: {
      id: '2',
      name: 'Garden Pros',
      slug: 'garden-pros'
    },
    category: {
      id: '3',
      name: 'Jardinería',
      slug: 'gardening'
    },
    rating: 4.7,
    reviewCount: 54
  },
  {
    id: '4',
    internalId: 'PRD004',
    name: 'Fratás para Concreto 48"',
    slug: 'concrete-bull-float',
    imageUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    description: 'Fratás para concreto de grado profesional para alisar superficies de concreto recién vertidas.',
    price: {
      daily: 28,
      weekly: 120,
      monthly: 340
    },
    company: {
      id: '3',
      name: 'Construction Rentals',
      slug: 'construction-rentals'
    },
    category: {
      id: '4',
      name: 'Construcción',
      slug: 'construction'
    },
    rating: 4.9,
    reviewCount: 37
  },
  {
    id: '5',
    internalId: 'PRD005',
    name: 'Lijadora Orbital 5"',
    slug: 'orbital-sander',
    imageUrl: 'https://images.unsplash.com/photo-1504898650098-3d90f32a9349',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504898650098-3d90f32a9349',
    description: 'Lijadora orbital compacta y potente. Ideal para acabados finos y trabajo en madera.',
    price: {
      hourly: 5,
      daily: 15,
      weekly: 70,
      monthly: 200
    },
    company: {
      id: '1',
      name: 'Pro Tools Inc.',
      slug: 'pro-tools-inc'
    },
    category: {
      id: '1',
      name: 'Herramientas Eléctricas',
      slug: 'power-tools'
    },
    rating: 4.5,
    reviewCount: 42
  }
];
