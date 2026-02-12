import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useRecaptchaToken } from "@/application/hooks/useCaptcha";

const schema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

interface SignUpFormProps {
    onSuccess?: () => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { execute, isLoadingConfig } = useRecaptchaToken();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data: FormValues) => {
        setSubmitError(null);

        try {
            setIsLoading(true);
            const captchaToken = await execute("register");
            await register(data.firstName, data.lastName, data.email, data.password, captchaToken);
            onSuccess?.();
        } catch (error) {
            const fields = (error as { payload?: { errors?: Record<string, string[]> } })?.payload?.errors;
            if (fields) {
                const firstNameError = fields.firstName?.[0];
                const lastNameError = fields.lastName?.[0];
                const emailError = fields.email?.[0];
                const passwordError = fields.password?.[0];
                const captchaError = fields.captchaToken?.[0];

                if (firstNameError) form.setError("firstName", { type: "server", message: firstNameError });
                if (lastNameError) form.setError("lastName", { type: "server", message: lastNameError });
                if (emailError) form.setError("email", { type: "server", message: emailError });
                if (passwordError) form.setError("password", { type: "server", message: passwordError });

                if (captchaError) {
                    setSubmitError("No se pudo validar reCAPTCHA. Vuelve a intentarlo.");
                    return;
                }
            }

            setSubmitError(
                error instanceof Error ? error.message : "No se pudo crear la cuenta. Inténtalo de nuevo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                {submitError && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {submitError}
                    </div>
                )}

                <FormField
                    name="firstName"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Tu nombre" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="lastName"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Tus apellidos" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" placeholder="tu@email.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" placeholder="••••••••" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button disabled={isLoading || isLoadingConfig} className="w-full" type="submit">
                    {isLoading ? "Creando..." : "Crear cuenta"}
                </Button>
            </form>
        </Form>
    );
};

export default SignUpForm;
