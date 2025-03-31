
/**
 * @fileoverview Modelo de dominio para alquileres
 */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Rental {
  id: string;
  product: string;
  customer: Customer;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  totalAmount: number;
  returned: boolean;
}

export type RentalStatus = Rental['status'];
