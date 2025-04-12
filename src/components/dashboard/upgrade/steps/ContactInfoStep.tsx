
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CompanyFormData } from '../UpgradePage';

// Validation schema for contact info
const contactInfoSchema = z.object({
  address: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres' }),
  contactEmail: z.string().email({ message: 'Debe ser un email válido' }),
  contactPhone: z.string().min(9, { message: 'Debe ser un número de teléfono válido' })
});

interface ContactInfoStepProps {
  formData: CompanyFormData;
  onUpdateFormData: (data: Partial<CompanyFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ContactInfoStep = ({ formData, onUpdateFormData, onNext, onBack }: ContactInfoStepProps) => {
  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      address: formData.address,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone
    }
  });

  const handleSubmit = (values: z.infer<typeof contactInfoSchema>) => {
    onUpdateFormData(values);
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Información de Contacto</h2>
        <p className="text-sm text-muted-foreground">¿Cómo pueden contactar contigo los clientes potenciales?</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Calle, Número, Ciudad, Código Postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="contacto@miempresa.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="612345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Volver
            </Button>
            <Button type="submit">
              Continuar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactInfoStep;
