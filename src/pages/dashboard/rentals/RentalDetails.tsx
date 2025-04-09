
import { useParams } from 'react-router-dom';
import { useRentalDetails } from '@/application/hooks/useRentalDetails';
import RentalDetailsHeader from '@/components/dashboard/rentals/details/RentalDetailsHeader';
import RentalDetailsCard from '@/components/dashboard/rentals/details/RentalDetailsCard';
import CustomerInfoCard from '@/components/dashboard/rentals/details/CustomerInfoCard';
import LoadingSpinner from '@/components/dashboard/rentals/details/LoadingSpinner';
import ErrorDisplay from '@/components/dashboard/rentals/details/ErrorDisplay';

const RentalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    rental, 
    isLoading, 
    error, 
    isUpdatingStatus,
    handleStatusChange,
    calculateDurationDays,
    formatDate
  } = useRentalDetails(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !rental) {
    return <ErrorDisplay errorMessage={error} />;
  }

  const durationDays = calculateDurationDays();
  const formattedStartDate = formatDate(rental.startDate);
  const formattedEndDate = formatDate(rental.endDate);

  return (
    <div className="container mx-auto py-6">
      <RentalDetailsHeader 
        rental={rental} 
        isUpdatingStatus={isUpdatingStatus}
        onStatusChange={handleStatusChange} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RentalDetailsCard 
          rental={rental}
          durationDays={durationDays}
          formattedStartDate={formattedStartDate}
          formattedEndDate={formattedEndDate}
        />
        
        <CustomerInfoCard rental={rental} />
      </div>
    </div>
  );
};

export default RentalDetails;
