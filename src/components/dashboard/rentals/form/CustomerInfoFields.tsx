import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';

interface CustomerInfoFieldsProps {
  form: UseFormReturn<RentalFormValues>;
}

const CustomerInfoFields = ({ form }: CustomerInfoFieldsProps) => {
  return (
    <>
      <h2 className="text-xl font-medium">Cliente</h2>
      <p className="text-sm text-muted-foreground">
        Introduce el email del cliente. Si tiene cuenta, se vinculara automaticamente; si no, quedara como cliente externo.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="renterEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email del cliente</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del cliente (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre para mostrar en tienda"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default CustomerInfoFields;
