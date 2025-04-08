
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';
import { RentalService } from '@/application/services/RentalService';
import { toast } from '@/components/ui/use-toast';
import { useProducts } from '@/application/hooks/useProducts';
import { Product } from '@/domain/models/Product';

// Validation schema
const rentalFormSchema = z.object({
  product: z.string().min(2, { message: 'El producto es requerido' }),
  customerId: z.string().min(1, { message: 'El cliente es requerido' }),
  customerName: z.string().min(2, { message: 'El nombre del cliente es requerido' }),
  customerEmail: z.string().email({ message: 'Email inválido' }),
  customerPhone: z.string().min(6, { message: 'El teléfono es requerido' }),
  startDate: z.date({ required_error: 'Fecha de inicio requerida' }),
  endDate: z.date({ required_error: 'Fecha de fin requerida' }),
  totalAmount: z.number().min(0, { message: 'El monto debe ser mayor a 0' }),
});

type RentalFormValues = z.infer<typeof rentalFormSchema>;

const CreateRental = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const rentalService = RentalService.getInstance();
  const { products, isLoading: productsLoading } = useProducts();

  // Filter products based on search input
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Default form values
  const defaultValues: Partial<RentalFormValues> = {
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    totalAmount: 0,
  };

  // Initialize form
  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues,
  });

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    form.setValue('product', product.name);
    // Calculate default rental price (7 days)
    form.setValue('totalAmount', product.price.weekly);
    setProductSearch('');
  };

  // Handle form submission
  const onSubmit = async (data: RentalFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare rental object
      const rental = {
        product: data.product,
        customer: {
          id: data.customerId,
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        totalAmount: data.totalAmount,
        status: 'upcoming' as const,
        returned: false,
      };

      // Create rental
      await rentalService.createRental(rental);
      
      toast({
        title: "Alquiler creado",
        description: "El alquiler ha sido creado exitosamente",
      });
      
      navigate('/dashboard/rentals');
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el alquiler",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Crear Alquiler</h1>
          <p className="text-muted-foreground">Completa el formulario para crear un nuevo alquiler</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/rentals')}>
          Volver
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-xl font-medium">Información del Producto</h2>
            <div>
              <div className="relative mb-6">
                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                  <Search className="ml-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                  />
                </div>
                
                {productSearch && (
                  <div className="absolute z-10 mt-1 w-full border rounded-md bg-background shadow-lg">
                    {filteredProducts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No se encontraron productos</div>
                    ) : (
                      <ul>
                        {filteredProducts.map((product) => (
                          <li 
                            key={product.id}
                            className="p-2 hover:bg-accent cursor-pointer text-sm"
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.price.daily}€ diario | {product.price.weekly}€ semanal
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              
              {selectedProduct && (
                <div className="bg-accent/10 p-4 rounded-md mb-4">
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Precios: </span>
                    <span>{selectedProduct.price.daily}€ diario | {selectedProduct.price.weekly}€ semanal | {selectedProduct.price.monthly}€ mensual</span>
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del producto" {...field} readOnly={!!selectedProduct} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />
            
            <h2 className="text-xl font-medium">Información del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="ID del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />

            <h2 className="text-xl font-medium">Detalles del Alquiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={es}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={es}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return date < startDate || date < new Date(new Date().setHours(0, 0, 0, 0));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importe Total</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          className="pl-7"
                        />
                        <span className="absolute left-3 top-2.5">€</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Importe total del alquiler en euros
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard/rentals')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear Alquiler"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateRental;
