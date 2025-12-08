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

interface SignInFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
    /**
     * Mensaje informativo extra (por ejemplo, tras “Olvidé mi contraseña”).
     */
    infoMessage?: string | null;
}

type SignInFormValues = {
    email: string;
    password: string;
};

const SignInForm = ({ onSuccess, onForgotPassword, infoMessage }: SignInFormProps) => {
    const { login } = useAuth();

    const form = useForm<SignInFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: SignInFormValues) => {
        await login(values.email, values.password);
        onSuccess?.();
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                    Inicia sesión en tu cuenta
                </h2>
                <p className="text-sm text-muted-foreground">
                    Accede para gestionar tus alquileres y tu perfil.
                </p>
            </div>

            {/* Banner informativo (p.ej. tras enviar enlace de recuperación) */}
            {infoMessage && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-semibold uppercase tracking-wide text-xs mb-1">
                        IMPORTANTE
                    </p>
                    <p>{infoMessage}</p>
                </div>
            )}

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

                    <FormField
                        control={form.control}
                        name="password"
                        rules={{ required: "La contraseña es obligatoria" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={onForgotPassword}
                        >
                            ¿Has olvidado tu contraseña?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default SignInForm;
