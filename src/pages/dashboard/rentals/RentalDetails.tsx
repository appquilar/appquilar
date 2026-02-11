
import { useParams } from 'react-router-dom';
import { useRentalDetails } from '@/application/hooks/useRentalDetails';
import RentalDetailsHeader from '@/components/dashboard/rentals/details/RentalDetailsHeader';
import RentalDetailsCard from '@/components/dashboard/rentals/details/RentalDetailsCard';
import CustomerInfoCard from '@/components/dashboard/rentals/details/CustomerInfoCard';
import RentalEditableCard from '@/components/dashboard/rentals/details/RentalEditableCard';
import RentalStateWizard from '@/components/dashboard/rentals/details/RentalStateWizard';
import LoadingSpinner from '@/components/dashboard/rentals/details/LoadingSpinner';
import ErrorDisplay from '@/components/dashboard/rentals/details/ErrorDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';

const RentalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { 
    rental, 
    isLoading, 
    error, 
    isUpdatingStatus,
    isUpdatingRental,
    canEditRental,
    viewerRole,
    nextTransitions,
    handleStatusChange,
    handleRentalUpdate,
    calculateDurationDays,
    formatDate
  } = useRentalDetails(id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [id]);

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
    <div className={`container mx-auto ${isMobile ? 'px-3 py-3' : 'py-6'}`}>
      <RentalDetailsHeader rental={rental} />

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <RentalStateWizard
          rental={rental}
          viewerRole={viewerRole}
          transitions={nextTransitions}
          isUpdatingStatus={isUpdatingStatus}
          onTransition={handleStatusChange}
        />

        <RentalDetailsCard 
          rental={rental}
          viewerRole={viewerRole}
          durationDays={durationDays}
          formattedStartDate={formattedStartDate}
          formattedEndDate={formattedEndDate}
        />

        {canEditRental && (
          <RentalEditableCard
            rental={rental}
            viewerRole={viewerRole}
            isSaving={isUpdatingRental}
            onSave={handleRentalUpdate}
          />
        )}

        <CustomerInfoCard rental={rental} />
      </div>
    </div>
  );
};

export default RentalDetails;
