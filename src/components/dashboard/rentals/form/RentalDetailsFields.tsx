
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';
import DateTimeField from './components/DateTimeField';
import MonetaryField from './components/MonetaryField';
import { useIsMobile } from '@/hooks/use-mobile';

interface RentalDetailsFieldsProps {
  form: UseFormReturn<RentalFormValues>;
}

const RentalDetailsFields = ({ form }: RentalDetailsFieldsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <h2 className="text-lg sm:text-xl font-medium">Detalles del Alquiler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <DateTimeField 
          form={form} 
          name="startDate" 
          label="Fecha de Inicio" 
          disabledDateFn={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} 
        />

        <DateTimeField 
          form={form} 
          name="endDate" 
          label="Fecha de Fin" 
          disabledDateFn={(date) => {
            const startDate = form.getValues("startDate");
            return date < startDate || date < new Date(new Date().setHours(0, 0, 0, 0));
          }} 
        />

        <MonetaryField 
          form={form} 
          name="totalAmount" 
          label="Importe Total" 
          description="Importe total del alquiler en euros" 
        />

        <MonetaryField 
          form={form} 
          name="depositAmount" 
          label="Importe de la Fianza" 
          description="Importe de la fianza en euros" 
          required={false} 
        />
      </div>
    </>
  );
};

export default RentalDetailsFields;
