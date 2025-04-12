
import React from 'react';
import RentalsOverview from '@/components/dashboard/rentals/presentation/RentalsOverview';

/**
 * Page component for rentals management
 */
const RentalsPage = () => {
  return (
    <div className="container px-2 sm:px-4 py-4 sm:py-6 mx-auto">
      <RentalsOverview />
    </div>
  );
};

export default RentalsPage;
