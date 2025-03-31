
import { Rental } from '@/domain/models/Rental';

// Mock rental data - would come from backend API in production
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
    startDate: '2023-07-15',
    endDate: '2023-07-18',
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
    startDate: '2023-07-12',
    endDate: '2023-07-19',
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
    startDate: '2023-07-10',
    endDate: '2023-07-12',
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
    startDate: '2023-07-18',
    endDate: '2023-07-20',
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
    startDate: '2023-07-16',
    endDate: '2023-07-18',
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
    startDate: '2023-07-05',
    endDate: '2023-07-10',
    status: 'completed',
    totalAmount: 225.00,
    returned: true
  },
];
