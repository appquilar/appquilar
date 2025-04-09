
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CreateRentalHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Crear Alquiler</h1>
        <p className="text-muted-foreground">Completa el formulario para crear un nuevo alquiler</p>
      </div>
      <Button variant="outline" onClick={() => navigate('/dashboard/rentals')}>
        Volver
      </Button>
    </div>
  );
};

export default CreateRentalHeader;
