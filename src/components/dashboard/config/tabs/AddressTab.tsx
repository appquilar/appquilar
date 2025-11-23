import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressFormValues } from '@/domain/schemas/userConfigSchema';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

interface AddressTabProps {
  addressForm: UseFormReturn<AddressFormValues>;
  onAddressSubmit: (data: AddressFormValues) => void;
}

const AddressTab: React.FC<AddressTabProps> = ({ addressForm, onAddressSubmit }) => {
  const streetInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Add VITE_GOOGLE_MAPS_API_KEY to enable address autocomplete.');
      return;
    }

    const initAutocomplete = () => {
      if (!streetInputRef.current || !window.google?.maps?.places) return;

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(streetInputRef.current, {
          fields: ['address_components', 'geometry', 'formatted_address'],
          types: ['address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (!place?.address_components) {
            toast.error('No se pudo obtener la información de la dirección');
            return;
          }

          let street = '';
          let streetNumber = '';
          let city = '';
          let state = '';
          let country = '';
          let postalCode = '';

          place.address_components.forEach((component) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            }
            if (types.includes('route')) {
              street = component.long_name;
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
            if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          });

          const fullStreet = streetNumber ? `${street} ${streetNumber}` : street;

          addressForm.setValue('street', fullStreet, { shouldValidate: true });
          addressForm.setValue('city', city, { shouldValidate: true });
          addressForm.setValue('state', state, { shouldValidate: true });
          addressForm.setValue('country', country, { shouldValidate: true });
          addressForm.setValue('postalCode', postalCode, { shouldValidate: true });
          
          if (place.geometry?.location) {
            addressForm.setValue('latitude', place.geometry.location.lat(), { shouldValidate: true });
            addressForm.setValue('longitude', place.geometry.location.lng(), { shouldValidate: true });
          }

          toast.success('Dirección completada automáticamente');
        });

        setIsLoadingMaps(false);
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setIsLoadingMaps(false);
      }
    };

    // Load Google Maps script
    if (!window.google?.maps?.places) {
      setIsLoadingMaps(true);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setIsLoadingMaps(false);
        toast.error('No se pudo cargar Google Maps');
      };
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [addressForm]);

  return (
    <Card>
        <CardHeader>
          <CardTitle>Dirección</CardTitle>
          <CardDescription>
            Configura tu dirección. Usa el autocompletado para encontrar tu ubicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
            <FormField
              control={addressForm.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calle y número</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      ref={streetInputRef}
                      placeholder="Empieza a escribir tu dirección..."
                      disabled={isLoadingMaps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addressForm.control}
              name="street2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección adicional (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Piso, departamento, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={addressForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado/Provincia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={addressForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(addressForm.watch('latitude') && addressForm.watch('longitude')) && (
              <div className="text-sm text-muted-foreground">
                Coordenadas: {addressForm.watch('latitude')?.toFixed(6)}, {addressForm.watch('longitude')?.toFixed(6)}
              </div>
            )}
            
            <CardFooter className="px-0 pb-0 pt-4">
              <Button type="submit">Guardar dirección</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddressTab;
