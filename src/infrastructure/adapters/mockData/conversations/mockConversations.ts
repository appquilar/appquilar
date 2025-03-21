/**
 * @fileoverview Datos de ejemplo para conversaciones
 * @module adapters/mockData/conversations/mockConversations
 */

import { Conversation } from '../../../../core/domain/Message';

/**
 * Crea las conversaciones de ejemplo
 */
export function createMockConversations(): Conversation[] {
  // Ejemplo de conversaciones para el usuario
  const conversation1: Conversation = {
    id: 'conv-1',
    productId: '1',
    userId: 'user-1',
    companyId: 'company-1',
    lastMessageAt: new Date(Date.now() - 3600000), // Hace 1 hora
    productName: 'Taladro Profesional 20V',
    productImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    companyName: 'Pro Tools Inc.',
    userName: 'Juan Pérez',
    unreadCount: 2,
  };

  const conversation2: Conversation = {
    id: 'conv-2',
    productId: '2',
    userId: 'user-1',
    companyId: 'company-2',
    lastMessageAt: new Date(Date.now() - 86400000), // Hace 1 día
    productName: 'Sierra Circular 1500W',
    productImage: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    companyName: 'Herramientas Express',
    userName: 'Juan Pérez',
    unreadCount: 0,
  };

  // Añadir 20 conversaciones más
  const additionalConversations: Conversation[] = [
    {
      id: 'conv-3',
      productId: '3',
      userId: 'user-1',
      companyId: 'company-3',
      lastMessageAt: new Date(Date.now() - 172800000), // Hace 2 días
      productName: 'Lijadora Orbital 300W',
      productImage: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407',
      companyName: 'Tools & Machines',
      userName: 'Juan Pérez',
      unreadCount: 1,
    },
    {
      id: 'conv-4',
      productId: '4',
      userId: 'user-1',
      companyId: 'company-4',
      lastMessageAt: new Date(Date.now() - 259200000), // Hace 3 días
      productName: 'Martillo Percutor SDS-Plus',
      productImage: 'https://images.unsplash.com/photo-1586864387789-628af9feed72',
      companyName: 'Construcciones Pro',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-5',
      productId: '5',
      userId: 'user-1',
      companyId: 'company-5',
      lastMessageAt: new Date(Date.now() - 345600000), // Hace 4 días
      productName: 'Compresor de Aire 50L',
      productImage: 'https://images.unsplash.com/photo-1535557597601-26f6a801c6ef',
      companyName: 'Aire Industrial',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-6',
      productId: '6',
      userId: 'user-1',
      companyId: 'company-6',
      lastMessageAt: new Date(Date.now() - 432000000), // Hace 5 días
      productName: 'Sierra de Calar 750W',
      productImage: 'https://images.unsplash.com/photo-1623661555674-010f4b3d88a3',
      companyName: 'Carpintería Moderna',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-7',
      productId: '7',
      userId: 'user-1',
      companyId: 'company-7',
      lastMessageAt: new Date(Date.now() - 518400000), // Hace 6 días
      productName: 'Amoladora Angular 900W',
      productImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
      companyName: 'Metalurgias del Sur',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-8',
      productId: '8',
      userId: 'user-1',
      companyId: 'company-8',
      lastMessageAt: new Date(Date.now() - 604800000), // Hace 7 días
      productName: 'Nivel Láser Autonivelante',
      productImage: 'https://images.unsplash.com/photo-1533667586627-9f5ddbd42539',
      companyName: 'Precisión Total',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-9',
      productId: '9',
      userId: 'user-1',
      companyId: 'company-9',
      lastMessageAt: new Date(Date.now() - 691200000), // Hace 8 días
      productName: 'Kit de Herramientas 150 pzs',
      productImage: 'https://images.unsplash.com/photo-1581166397057-235af2b3c6dd',
      companyName: 'Todo Herramientas',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-10',
      productId: '10',
      userId: 'user-1',
      companyId: 'company-10',
      lastMessageAt: new Date(Date.now() - 777600000), // Hace 9 días
      productName: 'Atornillador Eléctrico 12V',
      productImage: 'https://images.unsplash.com/photo-1563069923-bab33ca803cd',
      companyName: 'Electro Tools',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-11',
      productId: '11',
      userId: 'user-1',
      companyId: 'company-11',
      lastMessageAt: new Date(Date.now() - 864000000), // Hace 10 días
      productName: 'Pistola de Calor 2000W',
      productImage: 'https://images.unsplash.com/photo-1507473576955-a5071488aca3',
      companyName: 'Térmica Industrial',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-12',
      productId: '12',
      userId: 'user-1',
      companyId: 'company-12',
      lastMessageAt: new Date(Date.now() - 950400000), // Hace 11 días
      productName: 'Generador Eléctrico 2000W',
      productImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
      companyName: 'Energía Portátil',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-13',
      productId: '13',
      userId: 'user-1',
      companyId: 'company-13',
      lastMessageAt: new Date(Date.now() - 1036800000), // Hace 12 días
      productName: 'Hidrolavadora 130 Bar',
      productImage: 'https://images.unsplash.com/photo-1562813733-08197ab5ddf7',
      companyName: 'Limpieza Industrial',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-14',
      productId: '14',
      userId: 'user-1',
      companyId: 'company-14',
      lastMessageAt: new Date(Date.now() - 1123200000), // Hace 13 días
      productName: 'Fresadora Router 1800W',
      productImage: 'https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2',
      companyName: 'Fresados Precisos',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-15',
      productId: '15',
      userId: 'user-1',
      companyId: 'company-15',
      lastMessageAt: new Date(Date.now() - 1209600000), // Hace 14 días
      productName: 'Soldadora Inverter 200A',
      productImage: 'https://images.unsplash.com/photo-1549321495-305eb13f8aa9',
      companyName: 'Soldaduras Pro',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-16',
      productId: '16',
      userId: 'user-1',
      companyId: 'company-16',
      lastMessageAt: new Date(Date.now() - 1296000000), // Hace 15 días
      productName: 'Clavadora Neumática',
      productImage: 'https://images.unsplash.com/photo-1521633200178-c2ffc9ab636a',
      companyName: 'Neumática Industrial',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-17',
      productId: '17',
      userId: 'user-1',
      companyId: 'company-17',
      lastMessageAt: new Date(Date.now() - 1382400000), // Hace 16 días
      productName: 'Mezcladora de Cemento 125L',
      productImage: 'https://images.unsplash.com/photo-1516216628859-9bccecab13ca',
      companyName: 'Construcciones Rápidas',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-18',
      productId: '18',
      userId: 'user-1',
      companyId: 'company-18',
      lastMessageAt: new Date(Date.now() - 1468800000), // Hace 17 días
      productName: 'Escalera Telescópica 3.8m',
      productImage: 'https://images.unsplash.com/photo-1569701247509-79951c26a3e9',
      companyName: 'Acceso Seguro',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-19',
      productId: '19',
      userId: 'user-1',
      companyId: 'company-19',
      lastMessageAt: new Date(Date.now() - 1555200000), // Hace 18 días
      productName: 'Sierra de Mesa 1500W',
      productImage: 'https://images.unsplash.com/photo-1588952159215-a6737ebed0a4',
      companyName: 'Carpintería Total',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-20',
      productId: '20',
      userId: 'user-1',
      companyId: 'company-20',
      lastMessageAt: new Date(Date.now() - 1641600000), // Hace 19 días
      productName: 'Esmeriladora de Banco 350W',
      productImage: 'https://images.unsplash.com/photo-1634649548d1-896774a4fd6f',
      companyName: 'Talleres Unidos',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-21',
      productId: '21',
      userId: 'user-1',
      companyId: 'company-21',
      lastMessageAt: new Date(Date.now() - 1728000000), // Hace 20 días
      productName: 'Motosierra 45cc',
      productImage: 'https://images.unsplash.com/photo-1631636788702-4abfb308d08d',
      companyName: 'Forestal Tools',
      userName: 'Juan Pérez',
      unreadCount: 0,
    },
    {
      id: 'conv-22',
      productId: '22',
      userId: 'user-1',
      companyId: 'company-22',
      lastMessageAt: new Date(Date.now() - 1814400000), // Hace 21 días
      productName: 'Pulidora de Suelos 1300W',
      productImage: 'https://images.unsplash.com/photo-1583845112239-97ef1341b271',
      companyName: 'Suelos Perfectos',
      userName: 'Juan Pérez',
      unreadCount: 0,
    }
  ];

  return [conversation1, conversation2, ...additionalConversations];
}
