
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAddressMap } from '@/components/dashboard/hooks/useAddressMap';
import { PhoneNumberInput } from '@/components/ui/phone-number-input';
import { CompanyFormData } from '../UpgradePage';

// Validation schema for contact info
const contactInfoSchema = z.object({
  street: z.string().min(2, { message: 'La calle debe tener al menos 2 caracteres' }),
  street2: z.string().optional(),
  city: z.string().min(1, { message: 'La ciudad es obligatoria' }),
  state: z.string().min(1, { message: 'La provincia/estado es obligatoria' }),
  country: z.string().min(1, { message: 'El país es obligatorio' }),
  postalCode: z.string().min(1, { message: 'El código postal es obligatorio' }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
      latitude: formData.latitude,
      longitude: formData.longitude,
      contactEmail: formData.contactEmail,
      contactPhoneCountryCode: formData.contactPhoneCountryCode,
      contactPhonePrefix: formData.contactPhonePrefix,
      contactPhoneNumber: formData.contactPhoneNumber,
    }
  });
  const { autocompleteContainerRef, mapContainerRef, mapsError } = useAddressMap(form);
  const latitude = form.watch('latitude');
  const longitude = form.watch('longitude');
  const phoneCountryCode = form.watch('contactPhoneCountryCode');
  const phonePrefix = form.watch('contactPhonePrefix');
  const phoneNumber = form.watch('contactPhoneNumber');
  const phoneError =
    form.formState.errors.contactPhoneCountryCode?.message ||
    form.formState.errors.contactPhonePrefix?.message ||
    form.formState.errors.contactPhoneNumber?.message;

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
          <div className="space-y-1">
            <FormLabel>Buscar dirección</FormLabel>
            <div ref={autocompleteContainerRef} className="min-h-10" />
            <p className="text-xs text-muted-foreground">
              Empieza a escribir y selecciona tu dirección. Después puedes mover el pin para afinar la posición.
            </p>
            {mapsError && (
              <p className="text-xs text-destructive">
                {mapsError}
              </p>
            )}
          </div>

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
                    <Input placeholder="Piso, puerta, escalera..." {...field} value={field.value ?? ''} />
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

          <div className="space-y-2">
            <FormLabel>Ubicación en el mapa</FormLabel>
            <p className="text-xs text-muted-foreground">
              Nunca mostraremos la dirección exacta; sólo una ubicación aproximada cercana a tu empresa.
            </p>
            <div
              ref={mapContainerRef}
              className="h-[320px] w-full overflow-hidden rounded-md border"
            />
            {typeof latitude === 'number' && typeof longitude === 'number' && (
              <p className="text-xs text-muted-foreground">
                Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contacto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contacto@miempresa.com"
                      type="email"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label
                htmlFor="contact-phone-number"
                className="text-sm font-medium leading-none"
              >
                Teléfono de Contacto
              </label>
              <PhoneNumberInput
                id="contact-phone-number"
                countryCode={phoneCountryCode}
                prefix={phonePrefix}
                number={phoneNumber}
                invalid={Boolean(phoneError)}
                onCountryChange={({ countryCode, prefix }) => {
                  form.setValue('contactPhoneCountryCode', countryCode, { shouldValidate: true });
                  form.setValue('contactPhonePrefix', prefix, { shouldValidate: true });
                }}
                onNumberChange={(value) => {
                  form.setValue('contactPhoneNumber', value, { shouldValidate: true });
                }}
              />
              {phoneError && (
                <p className="text-sm font-medium text-destructive">
                  {phoneError}
                </p>
              )}
            </div>
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
