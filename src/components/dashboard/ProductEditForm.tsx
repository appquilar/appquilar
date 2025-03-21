
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Product } from '../products/ProductCard';

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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Validation schema for product form
const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.object({
    hourly: z.number().optional(),
    daily: z.number().min(1, { message: 'Daily price is required.' }),
    weekly: z.number().optional(),
    monthly: z.number().optional(),
  }),
  category: z.object({
    id: z.string(),
    name: z.string()
  }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductEditForm = ({ product, onSave, onCancel }: ProductEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing product values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: {
        hourly: product.price.hourly || undefined,
        daily: product.price.daily,
        weekly: product.price.weekly || undefined,
        monthly: product.price.monthly || undefined,
      },
      category: product.category,
      imageUrl: product.imageUrl,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send data to a backend API
      console.log('Saving product:', values);
      
      // Create updated product object
      const updatedProduct: Partial<Product> = {
        ...product,
        name: values.name,
        description: values.description,
        price: values.price,
        imageUrl: values.imageUrl,
        thumbnailUrl: values.imageUrl, // Using same URL for thumbnail for simplicity
        category: values.category,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the onSave callback with updated product
      onSave(updatedProduct);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Professional Tool Name" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your product in detail" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price.daily"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="25" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Required price per day</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price.hourly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="8" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Optional hourly rate</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price.weekly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="120" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Optional weekly rate</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price.monthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="350" 
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Optional monthly rate</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>URL to the product image</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductEditForm;
