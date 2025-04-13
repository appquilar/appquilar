
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CreateRentalHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center space-x-3 mb-4 ${isMobile ? 'py-2' : 'py-4'}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate('/dashboard/rentals')}
        className="h-8 w-8 flex-shrink-0"
      >
        <ArrowLeft size={16} />
      </Button>
      <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold`}>Crear Nuevo Alquiler</h1>
    </div>
  );
};

export default CreateRentalHeader;
