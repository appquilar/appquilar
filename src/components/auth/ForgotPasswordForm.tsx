
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Esquema de validación
const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

/**
 * Formulario de recuperación de contraseña
 */
const ForgotPasswordForm = ({ onSuccess, onBack }: ForgotPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Inicializar formulario con react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      // Simular envío de correo (en producción, conectar con backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      toast.success('Instrucciones enviadas a tu correo');
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      console.error('Error al enviar correo:', error);
      toast.error('No pudimos procesar tu solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <button 
          type="button"
          onClick={onBack}
          className="p-1 mr-2 hover:bg-secondary rounded-md"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold">Recuperar contraseña</h2>
      </div>
      
      {!emailSent ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Introduce tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="nombre@ejemplo.com" 
                        type="email" 
                        autoComplete="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instrucciones'
                )}
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Correo enviado</h3>
          <p className="text-muted-foreground mb-4">
            Hemos enviado instrucciones a tu correo electrónico.
            Revisa tu bandeja de entrada y sigue los pasos indicados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
