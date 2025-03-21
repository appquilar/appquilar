import { Product, AvailabilityPeriod } from '@/components/products/ProductCard';

// Sample availability periods for demo purposes
const currentDate = new Date();
const nextMonth = new Date(currentDate);
nextMonth.setMonth(currentDate.getMonth() + 1);
const twoMonthsLater = new Date(currentDate);
twoMonthsLater.setMonth(currentDate.getMonth() + 2);

// Helper to create ISO date strings without time component
const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Create some default availability periods
const createDefaultAvailability = (): AvailabilityPeriod[] => {
  // Create next 3 months of availability
  const periods: AvailabilityPeriod[] = [];
  const startDate = new Date();
  
  // Add 3 available periods, each 20 days long with 10-day gaps
  for (let i = 0; i < 3; i++) {
    const periodStart = new Date(startDate);
    periodStart.setDate(startDate.getDate() + (i * 30));
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 20);
    
    periods.push({
      id: `period-${i + 1}`,
      startDate: formatDateToISO(periodStart),
      endDate: formatDateToISO(periodEnd),
      status: 'available'
    });
  }
  
  // Add one upcoming rental period (example of a period that's already booked)
  const rentalStart = new Date(startDate);
  rentalStart.setDate(startDate.getDate() + 90); // 3 months from now
  
  const rentalEnd = new Date(rentalStart);
  rentalEnd.setDate(rentalStart.getDate() + 14); // 2 weeks rental
  
  periods.push({
    id: `period-rented`,
    startDate: formatDateToISO(rentalStart),
    endDate: formatDateToISO(rentalEnd),
    status: 'rented'
  });
  
  return periods;
};

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
    reviewCount: 124,
    availability: createDefaultAvailability()
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
    reviewCount: 89,
    availability: createDefaultAvailability()
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
    reviewCount: 54,
    availability: createDefaultAvailability()
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
    reviewCount: 37,
    availability: createDefaultAvailability()
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
    reviewCount: 42,
    availability: createDefaultAvailability()
  },
  {
    id: '6',
    internalId: 'PRD006',
    name: 'Compactadora de Placa',
    slug: 'plate-compactor',
    imageUrl: 'https://images.unsplash.com/photo-1588351829776-51410dbd1da1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1588351829776-51410dbd1da1',
    description: 'Compactadora de placa para consolidación de suelos y asfalto. Perfecta para proyectos de pavimentación pequeños y medianos.',
    price: {
      daily: 45,
      weekly: 180,
      monthly: 500
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
    rating: 4.7,
    reviewCount: 28,
    availability: createDefaultAvailability()
  },
  {
    id: '7',
    internalId: 'PRD007',
    name: 'Generador Portátil 3500W',
    slug: 'portable-generator-3500w',
    imageUrl: 'https://images.unsplash.com/photo-1590496794008-383c8070b257',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590496794008-383c8070b257',
    description: 'Generador portátil de 3500W para suministro eléctrico en obras y eventos. Incluye ruedas para facilitar el transporte.',
    price: {
      daily: 60,
      weekly: 240,
      monthly: 650
    },
    company: {
      id: '3',
      name: 'Construction Rentals',
      slug: 'construction-rentals'
    },
    category: {
      id: '2',
      name: 'Equipos Eléctricos',
      slug: 'electrical-equipment'
    },
    rating: 4.9,
    reviewCount: 45,
    availability: createDefaultAvailability()
  },
  {
    id: '8',
    internalId: 'PRD008',
    name: 'Cortadora de Césped Profesional',
    slug: 'professional-lawn-mower',
    imageUrl: 'https://images.unsplash.com/photo-1559060680-13019d0181ab',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559060680-13019d0181ab',
    description: 'Cortadora de césped autopropulsada para grandes áreas. Sistema de mulching incluido para fertilización natural.',
    price: {
      daily: 35,
      weekly: 150,
      monthly: 400
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
    rating: 4.6,
    reviewCount: 31,
    availability: createDefaultAvailability()
  },
  {
    id: '9',
    internalId: 'PRD009',
    name: 'Martillo Demoledor 30kg',
    slug: 'demolition-hammer-30kg',
    imageUrl: 'https://images.unsplash.com/photo-1504663246566-8e19a5efec2f',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504663246566-8e19a5efec2f',
    description: 'Martillo demoledor potente para trabajos de demolición en concreto y mampostería. Incluye estuche de transporte y brocas.',
    price: {
      daily: 55,
      weekly: 220,
      monthly: 600
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
    reviewCount: 37,
    availability: createDefaultAvailability()
  },
  {
    id: '10',
    internalId: 'PRD010',
    name: 'Andamio Plegable Multifunción',
    slug: 'folding-scaffold-tower',
    imageUrl: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9',
    description: 'Torre de andamio plegable ajustable en altura. Fácil montaje y transporte, incluye plataforma de trabajo y ruedas bloqueables.',
    price: {
      daily: 40,
      weekly: 170,
      monthly: 480
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
    rating: 4.5,
    reviewCount: 24,
    availability: createDefaultAvailability()
  },
  {
    id: '11',
    internalId: 'PRD011',
    name: 'Desbrozadora Profesional 52cc',
    slug: 'professional-brush-cutter-52cc',
    imageUrl: 'https://images.unsplash.com/photo-1590595978583-3967cf17d2ea',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590595978583-3967cf17d2ea',
    description: 'Desbrozadora con motor de 52cc para trabajos intensivos de jardinería. Incluye arnés ergonómico y accesorios intercambiables.',
    price: {
      daily: 30,
      weekly: 130,
      monthly: 350
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
    reviewCount: 29,
    availability: createDefaultAvailability()
  },
  {
    id: '12',
    internalId: 'PRD012',
    name: 'Sierra Circular 7-1/4"',
    slug: 'circular-saw-7-1-4',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38e922a83e9e',
    thumbnailUrl: 'https://images.unsplash.com/photo-1572981779307-38e922a83e9e',
    description: 'Sierra circular de mano con guía láser para cortes precisos. Motor de 1800W y ajuste de profundidad y ángulo.',
    price: {
      hourly: 6,
      daily: 18,
      weekly: 80,
      monthly: 220
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
    reviewCount: 42,
    availability: createDefaultAvailability()
  }
];

// For each product in MOCK_PRODUCTS array, add the availability property if it doesn't exist
MOCK_PRODUCTS.forEach(product => {
  if (!product.availability) {
    product.availability = createDefaultAvailability();
  }
});
