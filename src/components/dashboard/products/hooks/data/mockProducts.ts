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
  },
  {
    id: '6',
    internalId: 'PRD006',
    name: 'Cortadora de Césped Autopropulsada',
    slug: 'self-propelled-lawn-mower',
    imageUrl: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1',
    description: 'Cortadora de césped potente con sistema autopropulsado para un corte sin esfuerzo.',
    price: {
      daily: 30,
      weekly: 140,
      monthly: 420
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
    rating: 4.8,
    reviewCount: 63
  },
  {
    id: '7',
    internalId: 'PRD007',
    name: 'Compresor de Aire 2HP',
    slug: 'air-compressor-2hp',
    imageUrl: 'https://images.unsplash.com/photo-1518431401122-9b17f385d475',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518431401122-9b17f385d475',
    description: 'Compresor de aire portátil de 2HP con tanque de 50 litros. Ideal para herramientas neumáticas.',
    price: {
      daily: 22,
      weekly: 100,
      monthly: 300
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
    rating: 4.6,
    reviewCount: 29
  },
  {
    id: '8',
    internalId: 'PRD008',
    name: 'Escalera Extensible de Aluminio 20ft',
    slug: 'aluminum-extension-ladder',
    imageUrl: 'https://images.unsplash.com/photo-1547738238-5ddb16bef15f',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547738238-5ddb16bef15f',
    description: 'Escalera extensible de alta resistencia. Alcanza hasta 20 pies de altura.',
    price: {
      daily: 18,
      weekly: 85,
      monthly: 250
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
    rating: 4.4,
    reviewCount: 31
  },
  {
    id: '9',
    internalId: 'PRD009',
    name: 'Generador Portátil 2000W',
    slug: 'portable-generator-2000w',
    imageUrl: 'https://images.unsplash.com/photo-1574975242622-5f24f76c0555',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574975242622-5f24f76c0555',
    description: 'Generador portátil silencioso de 2000W. Perfecto para camping y situaciones de emergencia.',
    price: {
      daily: 40,
      weekly: 180,
      monthly: 520
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
    rating: 4.9,
    reviewCount: 58
  },
  {
    id: '10',
    internalId: 'PRD010',
    name: 'Mesa Plegable de Banquete 6ft',
    slug: 'folding-banquet-table',
    imageUrl: 'https://images.unsplash.com/photo-1565791380690-ca11d5ae3573',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565791380690-ca11d5ae3573',
    description: 'Mesa plegable rectangular de 6 pies, ideal para eventos, fiestas y reuniones.',
    price: {
      daily: 12,
      weekly: 55,
      monthly: 160
    },
    company: {
      id: '4',
      name: 'Event Essentials',
      slug: 'event-essentials'
    },
    category: {
      id: '5',
      name: 'Equipamiento para Eventos',
      slug: 'event-equipment'
    },
    rating: 4.5,
    reviewCount: 42
  },
  {
    id: '11',
    internalId: 'PRD011',
    name: 'Soplador de Hojas a Gasolina',
    slug: 'gas-leaf-blower',
    imageUrl: 'https://images.unsplash.com/photo-1598448251941-ae4dd47dba33',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598448251941-ae4dd47dba33',
    description: 'Potente soplador de hojas a gasolina. Ideal para limpieza de jardines y patios.',
    price: {
      daily: 25,
      weekly: 110,
      monthly: 320
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
    reviewCount: 36
  },
  {
    id: '12',
    internalId: 'PRD012',
    name: 'Hidrolavadora 2000 PSI',
    slug: 'pressure-washer-2000psi',
    imageUrl: 'https://images.unsplash.com/photo-1556767619-c2bde8904284',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556767619-c2bde8904284',
    description: 'Hidrolavadora eléctrica de 2000 PSI. Perfecta para limpieza de exteriores y vehículos.',
    price: {
      daily: 32,
      weekly: 145,
      monthly: 430
    },
    company: {
      id: '5',
      name: 'Clean Machine Rentals',
      slug: 'clean-machine-rentals'
    },
    category: {
      id: '6',
      name: 'Limpieza',
      slug: 'cleaning'
    },
    rating: 4.8,
    reviewCount: 47
  },
  {
    id: '13',
    internalId: 'PRD013',
    name: 'Mezcladora de Concreto 3.5 cu ft',
    slug: 'concrete-mixer-3-5cuft',
    imageUrl: 'https://images.unsplash.com/photo-1578763399478-e2dc51d90714',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578763399478-e2dc51d90714',
    description: 'Mezcladora de concreto duradera con capacidad de 3.5 pies cúbicos.',
    price: {
      daily: 38,
      weekly: 170,
      monthly: 490
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
    reviewCount: 53
  },
  {
    id: '14',
    internalId: 'PRD014',
    name: 'Juego de Iluminación para Eventos',
    slug: 'event-lighting-kit',
    imageUrl: 'https://images.unsplash.com/photo-1571538316127-fc18be7ad990',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571538316127-fc18be7ad990',
    description: 'Kit completo de iluminación LED para eventos. Incluye luces de ambiente, controlador y soportes.',
    price: {
      daily: 45,
      weekly: 200,
      monthly: 580
    },
    company: {
      id: '4',
      name: 'Event Essentials',
      slug: 'event-essentials'
    },
    category: {
      id: '5',
      name: 'Equipamiento para Eventos',
      slug: 'event-equipment'
    },
    rating: 4.7,
    reviewCount: 39
  },
  {
    id: '15',
    internalId: 'PRD015',
    name: 'Lijadora de Piso Industrial',
    slug: 'industrial-floor-sander',
    imageUrl: 'https://images.unsplash.com/photo-1616593871468-2a9559243920',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616593871468-2a9559243920',
    description: 'Lijadora de piso industrial para renovación de pisos de madera y parquet.',
    price: {
      daily: 55,
      weekly: 240,
      monthly: 680
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
    reviewCount: 48
  },
  {
    id: '16',
    internalId: 'PRD016',
    name: 'Carpa para Eventos 10x20',
    slug: 'event-tent-10x20',
    imageUrl: 'https://images.unsplash.com/photo-1560216311-a356fa02954d',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560216311-a356fa02954d',
    description: 'Carpa grande para eventos de 10x20 pies. Incluye paredes laterales y kit de anclaje.',
    price: {
      daily: 120,
      weekly: 500,
      monthly: 1400
    },
    company: {
      id: '4',
      name: 'Event Essentials',
      slug: 'event-essentials'
    },
    category: {
      id: '5',
      name: 'Equipamiento para Eventos',
      slug: 'event-equipment'
    },
    rating: 4.8,
    reviewCount: 72
  },
  {
    id: '17',
    internalId: 'PRD017',
    name: 'Aspiradora Industrial en Seco/Húmedo',
    slug: 'industrial-wet-dry-vacuum',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001',
    description: 'Aspiradora industrial potente para uso en seco y húmedo. Ideal para limpieza de construcción.',
    price: {
      daily: 35,
      weekly: 150,
      monthly: 420
    },
    company: {
      id: '5',
      name: 'Clean Machine Rentals',
      slug: 'clean-machine-rentals'
    },
    category: {
      id: '6',
      name: 'Limpieza',
      slug: 'cleaning'
    },
    rating: 4.6,
    reviewCount: 43
  },
  {
    id: '18',
    internalId: 'PRD018',
    name: 'Cortacésped Manual',
    slug: 'manual-push-mower',
    imageUrl: 'https://images.unsplash.com/photo-1589365252845-092198ba5334',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589365252845-092198ba5334',
    description: 'Cortacésped manual ecológico y silencioso. Perfecto para jardines pequeños.',
    price: {
      daily: 15,
      weekly: 65,
      monthly: 180
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
    rating: 4.4,
    reviewCount: 29
  },
  {
    id: '19',
    internalId: 'PRD019',
    name: 'Motosierra de 18"',
    slug: 'chainsaw-18inch',
    imageUrl: 'https://images.unsplash.com/photo-1598752192356-9c440cac4fe9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598752192356-9c440cac4fe9',
    description: 'Motosierra potente con barra de 18 pulgadas. Ideal para corte de árboles y troncos.',
    price: {
      daily: 42,
      weekly: 180,
      monthly: 520
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
    reviewCount: 58
  },
  {
    id: '20',
    internalId: 'PRD020',
    name: 'Sistema de Sonido para Eventos',
    slug: 'event-sound-system',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    description: 'Sistema de sonido completo para eventos, incluye altavoces, mezcladora y micrófonos.',
    price: {
      daily: 95,
      weekly: 420,
      monthly: 1200
    },
    company: {
      id: '4',
      name: 'Event Essentials',
      slug: 'event-essentials'
    },
    category: {
      id: '5',
      name: 'Equipamiento para Eventos',
      slug: 'event-equipment'
    },
    rating: 4.9,
    reviewCount: 67
  }
];
