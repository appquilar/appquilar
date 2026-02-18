
import React from 'react';
import RentalsOverview from '@/components/dashboard/rentals/presentation/RentalsOverview';

/**
 * Page component for rentals management
 */
const RentalsPage = () => {
  return (
    <div className="space-y-6 pb-20 sm:pb-4">
      <RentalsOverview />
    </div>
  );
};

export default RentalsPage;
