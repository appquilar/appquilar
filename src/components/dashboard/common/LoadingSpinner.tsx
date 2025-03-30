
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="p-6 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
