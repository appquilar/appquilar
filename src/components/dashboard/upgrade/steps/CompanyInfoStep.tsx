
import { useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CompanyFormData } from '../UpgradePage';
import { Textarea } from '@/components/ui/textarea';

// Validation schema for company info
const companyInfoSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres' }),
  fiscalId: z.string().min(5, { message: 'El ID fiscal debe tener al menos 5 caracteres' }),
  slug: z.string().min(3, { message: 'El slug debe tener al menos 3 caracteres' })
    .regex(/^[a-z0-9-]+$/, { message: 'Solo letras minúsculas, números y guiones' })
});

interface CompanyInfoStepProps {
  formData: CompanyFormData;
  onUpdateFormData: (data: Partial<CompanyFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CompanyInfoStep = ({ formData, onUpdateFormData, onNext, onBack }: CompanyInfoStepProps) => {
  const form = useForm<z.infer<typeof companyInfoSchema>>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      name: formData.name,
      description: formData.description,
      fiscalId: formData.fiscalId,
      slug: formData.slug
    }
  });

  // Auto-generate slug from company name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name') {
        const nameValue = value.name as string;
        if (nameValue) {
          // Generate slug: lowercase, replace spaces with hyphens, remove special chars
          const generatedSlug = nameValue
            .toLowerCase()
            .normalize('NFD') // Normalize accented characters
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
            
          form.setValue('slug', generatedSlug, { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (values: z.infer<typeof companyInfoSchema>) => {
    onUpdateFormData(values);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Información de la Empresa</h2>
        <p className="text-muted-foreground">Proporciona la información básica sobre tu empresa.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Mi Empresa S.L." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Una breve descripción de tu empresa y sus servicios de alquiler" 
                    className="resize-none min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fiscalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Fiscal (CIF/NIF)</FormLabel>
                  <FormControl>
                    <Input placeholder="B12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="mi-empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">Se genera automáticamente a partir del nombre</p>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancelar
            </Button>
            <Button type="submit">Continuar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompanyInfoStep;
