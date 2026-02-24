import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail } from "lucide-react";

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
     * Mensaje informativo extra (por ejemplo, tras registro,
     * cambio de contraseña o envío del correo de recuperación).
     */
    infoMessage?: string | null;
}

type SignInFormValues = {
    email: string;
    password: string;
};

/**
 * Intenta detectar si el error devuelto por la API corresponde a
 * credenciales inválidas: {"success":false,"error":["login.invalid"]}
 */
const isInvalidCredentialsError = (error: unknown): boolean => {
    if (!error) return false;

    const anyErr: any = error;

    // Caso mensaje en el propio error
    if (
        typeof anyErr?.message === "string" &&
        anyErr.message.includes("login.invalid")
    ) {
        return true;
    }

    // Caso payload directo { success: false, error: [...] }
    if (Array.isArray(anyErr?.error)) {
        if (anyErr.error.includes("login.invalid")) {
            return true;
        }
    }

    // Caso estilo axios/fetch con response.data/body
    const data = anyErr?.response?.data ?? anyErr?.body ?? anyErr?.data ?? null;

    if (!data) return false;

    if (Array.isArray(data.error) && data.error.includes("login.invalid")) {
        return true;
    }

    if (Array.isArray(data.errors) && data.errors.includes("login.invalid")) {
        return true;
    }

    return false;
};

const SignInForm = ({
                        onSuccess,
                        onForgotPassword,
                        infoMessage,
                    }: SignInFormProps) => {
    const { login } = useAuth();
    const [loginError, setLoginError] = useState<string | null>(null);

    const form = useForm<SignInFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: SignInFormValues) => {
        setLoginError(null);

        try {
            await login(values.email, values.password);
            onSuccess?.();
        } catch (error) {
            setLoginError(
                "El correo electrónico o la contraseña no son correctos.",
            );
        }
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="space-y-4">
            {/* Banner informativo (registro, cambio contraseña, forgot-password, etc.) */}
            {infoMessage && !loginError && (
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                        IMPORTANTE
                    </p>
                    <p>{infoMessage}</p>
                </div>
            )}

            {/* Error específico de login (credenciales incorrectas u otros errores de login) */}
            {loginError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                        ERROR
                    </p>
                    <p>{loginError}</p>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                        control={form.control}
                        name="email"
                        rules={{ required: "El email es obligatorio" }}
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[12px] font-medium text-muted-foreground">
                                    Correo electrónico
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <Input
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="h-11 rounded-lg border-border/80 pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        rules={{ required: "La contraseña es obligatoria" }}
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-[12px] font-medium text-muted-foreground">
                                    Contraseña
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock
                                            size={16}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-11 rounded-lg border-border/80 pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <div className="text-right">
                        <button
                            type="button"
                            className="text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
                            onClick={() => {
                                setLoginError(null);
                                onForgotPassword?.();
                            }}
                        >
                            ¿Has olvidado tu contraseña?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
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
