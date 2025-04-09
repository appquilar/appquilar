
import React, { ReactNode } from 'react';
import { LoadingSpinner } from './details/LoadingSpinner';
import { ErrorDisplay } from './details/ErrorDisplay';

interface RentalsContainerProps {
  isLoading: boolean;
  error: string | null;
  children: ReactNode;
}

const RentalsContainer = ({ isLoading, error, children }: RentalsContainerProps) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay errorMessage={error} />;
  }
  
  return <>{children}</>;
};

export default RentalsContainer;
