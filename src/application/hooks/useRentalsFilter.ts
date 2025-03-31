
import { useState, useMemo } from 'react';
import { Rental } from '@/domain/models/Rental';

export interface RentalFilters {
  searchQuery: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  rentalId: string;
  activeTab: string;
}

export interface RentalCounts {
  all: number;
  active: number;
  upcoming: number;
  completed: number;
}

export interface UseRentalsFilterReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  rentalId: string;
  setRentalId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRentals: Rental[];
  rentalCounts: RentalCounts;
  handleSearch: (e: React.FormEvent) => void;
  handleDateSelect: (date: Date) => void;
}

export const useRentalsFilter = (rentals: Rental[]): UseRentalsFilterReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rentalId, setRentalId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Calculate counts of rentals by status
  const rentalCounts = useMemo(() => ({
    all: rentals.length,
    active: rentals.filter(r => r.status === 'active').length,
    upcoming: rentals.filter(r => r.status === 'upcoming').length,
    completed: rentals.filter(r => r.status === 'completed').length,
  }), [rentals]);
  
  // Filter rentals based on all criteria
  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      // Filter by search query (name or email)
      const nameMatch = searchQuery 
        ? rental.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rental.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rental.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      // Filter by rental ID
      const idMatch = rentalId 
        ? rental.id.includes(rentalId)
        : true;
      
      // Filter by date range
      const rentalStartDate = new Date(rental.startDate);
      const rentalEndDate = new Date(rental.endDate);
      
      const dateMatch = (startDate && endDate)
        ? (rentalStartDate >= startDate && rentalStartDate <= endDate) ||
          (rentalEndDate >= startDate && rentalEndDate <= endDate) ||
          (rentalStartDate <= startDate && rentalEndDate >= endDate)
        : startDate
          ? rentalStartDate >= startDate || rentalEndDate >= startDate
          : endDate
            ? rentalStartDate <= endDate || rentalEndDate <= endDate
            : true;
      
      // Filter by tab/status
      const statusMatch = activeTab === 'all' 
        ? true 
        : rental.status === activeTab;
      
      return nameMatch && idMatch && dateMatch && statusMatch;
    });
  }, [rentals, searchQuery, rentalId, startDate, endDate, activeTab]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    // Implement logic to filter rentals for the selected date
  };

  return {
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    rentalId,
    setRentalId,
    activeTab,
    setActiveTab,
    filteredRentals,
    rentalCounts,
    handleSearch,
    handleDateSelect
  };
};
