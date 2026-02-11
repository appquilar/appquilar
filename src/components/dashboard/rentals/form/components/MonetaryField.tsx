import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';

interface MonetaryFieldProps {
  form: UseFormReturn<RentalFormValues>;
  amountName: 'priceAmount' | 'depositAmount';
  currencyName: 'priceCurrency' | 'depositCurrency';
  label: string;
  description: string;
  disabled?: boolean;
}

const MonetaryField = ({ form, amountName, currencyName, label, description, disabled = false }: MonetaryFieldProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={amountName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0.00"
                {...field}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(Number.isNaN(value) ? 0 : value);
                }}
                min={0}
                disabled={disabled}
              />
            </FormControl>
            <FormDescription>{description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={currencyName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moneda</FormLabel>
            <FormControl>
              <Input placeholder="EUR" {...field} maxLength={3} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MonetaryField;
