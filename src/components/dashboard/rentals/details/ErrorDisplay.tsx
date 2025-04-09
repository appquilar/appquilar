
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorDisplayProps {
  errorMessage: string | null;
}

export const ErrorDisplay = ({ errorMessage }: ErrorDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 rounded-md bg-destructive/10 text-destructive">
      <AlertTriangle className="w-6 h-6 mb-2" />
      <h2 className="text-lg font-medium">Error</h2>
      <p>{errorMessage || 'No se pudo cargar la información del alquiler'}</p>
      <Button 
        variant="outline" 
        className="mt-4" 
        onClick={() => navigate('/dashboard/rentals')}
      >
        Volver a la lista
      </Button>
    </div>
  );
};

export default ErrorDisplay;
