
import { useState } from 'react';
import { useRentals } from '@/application/hooks/useRentals';
import { Rental } from '@/domain/models/Rental';

export const useRentalsData = () => {
  const { rentals, isLoading, error, getRentalsByStatus } = useRentals();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [rentalId, setRentalId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter rentals based on search query, dates, rental ID and active tab
  const filteredRentals = rentals.filter((rental: Rental) => {
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
  
  // Count rentals by status
  const rentalCounts = {
    all: rentals.length,
    active: rentals.filter((r: Rental) => r.status === 'active').length,
    upcoming: rentals.filter((r: Rental) => r.status === 'upcoming').length,
    completed: rentals.filter((r: Rental) => r.status === 'completed').length,
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This could call an API endpoint in a real app
  };
  
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    // Implement logic to filter rentals for the selected date
  };

  return {
    rentals,
    isLoading,
    error,
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
