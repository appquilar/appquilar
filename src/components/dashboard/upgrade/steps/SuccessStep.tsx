
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface SuccessStepProps {
  planName: string;
  companyName: string;
  onClose: () => void;
}

const SuccessStep = ({ planName, companyName, onClose }: SuccessStepProps) => {
  return (
    <div className="text-center py-6 space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">¡Felicidades!</h2>
        <p className="text-lg">
          Tu empresa <span className="font-semibold">{companyName}</span> ha sido registrada exitosamente.
        </p>
        <p className="text-muted-foreground">
          Has seleccionado el <span className="font-medium text-foreground">Plan {planName}</span>. 
          Ya puedes empezar a gestionar tus productos y configurar tu cuenta de empresa.
        </p>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg mx-auto max-w-md">
        <h3 className="font-medium mb-2">Próximos pasos:</h3>
        <ul className="text-sm text-left space-y-2">
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary font-medium rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
            <span>Completa tu perfil de empresa desde la sección de configuración</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary font-medium rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
            <span>Añade tus primeros productos al catálogo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-primary/20 text-primary font-medium rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
            <span>Configura tu disponibilidad y precios</span>
          </li>
        </ul>
      </div>
      
      <Button onClick={onClose} className="mt-6">
        Comenzar a Usar
      </Button>
    </div>
  );
};

export default SuccessStep;
