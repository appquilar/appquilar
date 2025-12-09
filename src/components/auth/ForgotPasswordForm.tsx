import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ForgotPasswordFormProps {
    onBack: () => void;
    onSuccess?: () => void;
}

type ForgotPasswordFormValues = {
    email: string;
};

const ForgotPasswordForm = ({ onBack, onSuccess }: ForgotPasswordFormProps) => {
    const { requestPasswordReset } = useAuth();

    const form = useForm<ForgotPasswordFormValues>({
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        await requestPasswordReset(values.email);
        // La navegación y el mensaje los gestiona AuthModal
        onSuccess?.();
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                    ¿Has olvidado tu contraseña?
                </h2>
                <p className="text-sm text-muted-foreground">
                    Introduce el correo con el que te registraste y te enviaremos un
                    enlace para que puedas crear una nueva contraseña.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        rules={{ required: "El email es obligatorio" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo electrónico</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="tu@email.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Enviando correo..." : "Enviar enlace de recuperación"}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm"
                        onClick={onBack}
                    >
                        Volver a iniciar sesión
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default ForgotPasswordForm;
