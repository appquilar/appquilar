
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}

const FormActions = ({
  isSubmitting,
  onCancel,
  submitDisabled = false,
  submitLabel = 'Crear Alquiler',
}: FormActionsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex justify-end space-x-3 ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-background border-t p-3 z-10' : 'pt-6'}`}>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
        className={isMobile ? 'flex-1' : ''}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || submitDisabled}
        className={isMobile ? 'flex-1' : ''}
      >
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </div>
  );
};

export default FormActions;
