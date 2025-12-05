import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";

interface SignInFormValues {
    email: string;
    password: string;
}

interface ForgotPasswordFormValues {
    email: string;
}

interface SignInFormProps {
    onSuccess?: () => void;
    /**
     * Optional informative message coming from the parent (e.g.:
     * "User created, please log in").
     */
    infoMessage?: string;
}

/**
 * Sign-in form that also contains the "forgot password" flow
 * inside the same modal/tab.
 *
 * IMPORTANT:
 * - We do NOT use shadcn/ui <Form> abstractions here.
 * - We use react-hook-form directly via `register` and `handleSubmit`.
 * - Validation is minimal: only required fields on the client.
 * - The backend is responsible for validating email/password format.
 */
const SignInForm = ({ onSuccess, infoMessage }: SignInFormProps) => {
    const { login, requestPasswordReset } = useAuth();

    const [mode, setMode] = useState<"signin" | "forgotPassword">("signin");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [localInfoMessage, setLocalInfoMessage] = useState<string | null>(
        null
    );

    const effectiveInfoMessage = localInfoMessage ?? infoMessage;

    // -----------------
    // react-hook-form: sign-in
    // -----------------
    const {
        register: registerSignIn,
        handleSubmit: handleSignInSubmit,
        setValue: setSignInValue,
        formState: { errors: signInErrors },
    } = useForm<SignInFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });

    // -----------------
    // react-hook-form: forgot-password
    // -----------------
    const {
        register: registerForgot,
        handleSubmit: handleForgotSubmit,
        setValue: setForgotValue,
        formState: { errors: forgotErrors },
    } = useForm<ForgotPasswordFormValues>({
        defaultValues: {
            email: "",
        },
        mode: "onSubmit",
    });

    // -----------------
    // Handlers
    // -----------------

    const onSubmitSignIn = async (data: SignInFormValues): Promise<void> => {
        const trimmedEmail = data.email.trim();
        const trimmedPassword = data.password.trim();

        try {
            setIsLoading(true);
            await login(trimmedEmail, trimmedPassword);

            toast.success("Has iniciado sesión correctamente");

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error de inicio de sesión:", error);
            toast.error("Credenciales incorrectas");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmitForgotPassword = async (
        data: ForgotPasswordFormValues
    ): Promise<void> => {
        const trimmedEmail = data.email.trim();

        try {
            setIsForgotLoading(true);
            await requestPasswordReset(trimmedEmail);

            toast.success(
                "Se ha enviado un correo al email indicado. Revisa tu bandeja de entrada y sigue las instrucciones."
            );

            setLocalInfoMessage(
                "Se ha enviado un correo al email indicado. Revisa tu bandeja de entrada y sigue las instrucciones."
            );

            setMode("signin");
        } catch (error) {
            console.error(
                "Error al solicitar el restablecimiento de contraseña:",
                error
            );
            toast.error(
                "No se ha podido enviar el correo de restablecimiento. Por favor, inténtalo de nuevo."
            );
        } finally {
            setIsForgotLoading(false);
        }
    };

    const switchToForgotPassword = () => {
        setLocalInfoMessage(null);
        setMode("forgotPassword");

        // Prefill forgot-password email with sign-in email
        const currentSignInEmail = (
            document.getElementById("signin-email") as HTMLInputElement | null
        )?.value;

        if (currentSignInEmail) {
            setForgotValue("email", currentSignInEmail);
        }
    };

    const switchToSignIn = () => {
        setMode("signin");
    };

    const renderInfoBanner = () => {
        if (!effectiveInfoMessage) {
            return null;
        }

        return (
            <div className="mb-2 flex gap-2 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                <Info className="mt-[2px] h-4 w-4 flex-shrink-0" />
                <p>{effectiveInfoMessage}</p>
            </div>
        );
    };

    const renderError = (message?: string) => {
        if (!message) return null;
        return (
            <p className="mt-1 text-xs font-medium text-red-500">{message}</p>
        );
    };

    // -----------------
    // Forgot-password view
    // -----------------
    if (mode === "forgotPassword") {
        return (
            <form
                onSubmit={handleForgotSubmit(onSubmitForgotPassword)}
                className="space-y-4"
            >
                {renderInfoBanner()}

                <div className="space-y-1">
                    <label className="block text-sm font-medium">
                        Correo electrónico
                    </label>
                    <Input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        placeholder="nombre@ejemplo.com"
                        {...registerForgot("email", {
                            required: "El correo electrónico es obligatorio",
                        })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Introduce el correo con el que te registraste y te
                        enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    {renderError(forgotErrors.email?.message)}
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isForgotLoading}
                    >
                        {isForgotLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando correo...
                            </>
                        ) : (
                            "Enviar instrucciones"
                        )}
                    </Button>

                    <button
                        type="button"
                        className="w-full text-center text-xs text-primary hover:underline"
                        onClick={switchToSignIn}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </form>
        );
    }

    // -----------------
    // Normal sign-in view
    // -----------------
    return (
        <form
            onSubmit={handleSignInSubmit(onSubmitSignIn)}
            className="space-y-4"
        >
            {renderInfoBanner()}

            <div className="space-y-1">
                <label
                    htmlFor="signin-email"
                    className="block text-sm font-medium"
                >
                    Correo electrónico
                </label>
                <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@ejemplo.com"
                    {...registerSignIn("email", {
                        required: "El correo electrónico es obligatorio",
                    })}
                />
                {renderError(signInErrors.email?.message)}
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="signin-password"
                    className="block text-sm font-medium"
                >
                    Contraseña
                </label>
                <div className="relative">
                    <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        {...registerSignIn("password", {
                            required: "La contraseña es obligatoria",
                            minLength: {
                                value: 6,
                                message:
                                    "La contraseña debe tener al menos 6 caracteres",
                            },
                        })}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                </div>
                {renderError(signInErrors.password?.message)}
                <div className="mt-1 text-right text-xs">
                    <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={switchToForgotPassword}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    "Iniciar sesión"
                )}
            </Button>
        </form>
    );
};

export default SignInForm;
