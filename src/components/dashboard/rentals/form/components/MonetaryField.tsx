
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';

interface MonetaryFieldProps {
  form: UseFormReturn<RentalFormValues>;
  name: "totalAmount" | "depositAmount";
  label: string;
  description: string;
  required?: boolean;
}

const MonetaryField = ({ form, name, label, description, required = true }: MonetaryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="number" 
                placeholder="0.00" 
                {...field}
                onChange={e => field.onChange(parseFloat(e.target.value))}
                className="pl-7"
                required={required}
              />
              <span className="absolute left-3 top-2.5">€</span>
            </div>
          </FormControl>
          <FormDescription>
            {description}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MonetaryField;
