
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CompanyFormData } from '../UpgradePage';

// Validation schema for contact info
const contactInfoSchema = z.object({
  street: z.string().min(2, { message: 'La calle debe tener al menos 2 caracteres' }),
  street2: z.string().optional(),
  city: z.string().min(1, { message: 'La ciudad es obligatoria' }),
  state: z.string().min(1, { message: 'La provincia/estado es obligatoria' }),
  country: z.string().min(1, { message: 'El país es obligatorio' }),
  postalCode: z.string().min(1, { message: 'El código postal es obligatorio' }),
  contactEmail: z.string().email({ message: 'Debe ser un email válido' }),
  contactPhoneCountryCode: z.string().min(2, { message: 'País obligatorio' }),
  contactPhonePrefix: z.string().min(2, { message: 'Prefijo obligatorio' }),
  contactPhoneNumber: z.string().min(6, { message: 'Debe ser un número de teléfono válido' })
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
      street: formData.street,
      street2: formData.street2,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      postalCode: formData.postalCode,
      contactEmail: formData.contactEmail,
      contactPhoneCountryCode: formData.contactPhoneCountryCode,
      contactPhonePrefix: formData.contactPhonePrefix,
      contactPhoneNumber: formData.contactPhoneNumber,
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
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle y número</FormLabel>
                <FormControl>
                  <Input placeholder="Calle y número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="street2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección adicional (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Piso, puerta, escalera..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ciudad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia / Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="Provincia o estado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="País" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código postal</FormLabel>
                  <FormControl>
                    <Input placeholder="Código postal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="contactPhoneCountryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="ES" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhonePrefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prefijo</FormLabel>
                  <FormControl>
                    <Input placeholder="+34" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
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
