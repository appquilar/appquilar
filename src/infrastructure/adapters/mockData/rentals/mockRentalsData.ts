
import { Rental } from '@/domain/models/Rental';

export const MOCK_RENTALS: Rental[] = [
  {
    id: '1',
    product: 'Hammer Drill 20V',
    customer: {
      id: 'c1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '123-456-7890'
    },
    startDate: '2025-04-03',
    endDate: '2025-04-08',
    status: 'active',
    totalAmount: 75.00,
    returned: false
  },
  {
    id: '2',
    product: 'Table Saw with Stand',
    customer: {
      id: 'c2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '234-567-8901'
    },
    startDate: '2025-04-01',
    endDate: '2025-04-09',
    status: 'active',
    totalAmount: 245.00,
    returned: false
  },
  {
    id: '3',
    product: 'Landscaping Tool Set',
    customer: {
      id: 'c3',
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '345-678-9012'
    },
    startDate: '2025-03-30',
    endDate: '2025-04-02',
    status: 'completed',
    totalAmount: 40.00,
    returned: true
  },
  {
    id: '4',
    product: '48" Concrete Bull Float',
    customer: {
      id: 'c4',
      name: 'Emily Wilson',
      email: 'emily@example.com',
      phone: '456-789-0123'
    },
    startDate: '2025-04-10',
    endDate: '2025-04-15',
    status: 'upcoming',
    totalAmount: 56.00,
    returned: false
  },
  {
    id: '5',
    product: 'Folding Banquet Tables',
    customer: {
      id: 'c5',
      name: 'David Thompson',
      email: 'david@example.com',
      phone: '567-890-1234'
    },
    startDate: '2025-04-04',
    endDate: '2025-04-07',
    status: 'active',
    totalAmount: 80.00,
    returned: false
  },
  {
    id: '6',
    product: 'Commercial Carpet Cleaner',
    customer: {
      id: 'c6',
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      phone: '678-901-2345'
    },
    startDate: '2025-03-25',
    endDate: '2025-03-30',
    status: 'completed',
    totalAmount: 225.00,
    returned: true
  },
  {
    id: '7',
    product: 'Electric Chainsaw',
    customer: {
      id: 'c7',
      name: 'Robert Garcia',
      email: 'robert@example.com',
      phone: '789-012-3456'
    },
    startDate: '2025-04-15',
    endDate: '2025-04-18',
    status: 'upcoming',
    totalAmount: 65.00,
    returned: false
  },
  {
    id: '8',
    product: 'Portable Generator',
    customer: {
      id: 'c8',
      name: 'Jennifer Lee',
      email: 'jennifer@example.com',
      phone: '890-123-4567'
    },
    startDate: '2025-04-06',
    endDate: '2025-04-12',
    status: 'active',
    totalAmount: 120.00,
    returned: false
  }
];
