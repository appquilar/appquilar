import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Loader2} from "lucide-react";
import {toast} from "sonner";

// Ajusta estos imports a tu layout real
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(6, "La contraseña debe tener al menos 6 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();

    // Email y token vienen en la URL (?email=...&token=...)
    const token = searchParams.get("token") ?? undefined;
    const email = searchParams.get("email") ?? undefined;

    const navigate = useNavigate();
    const { resetPassword } = useAuth(); // firma: (email, token, newPassword)

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const renderCard = (content: React.ReactNode) => (
        <div className="bg-muted/20 px-4 pt-24 pb-16">
            <div className="mx-auto w-full max-w-md rounded-2xl border bg-background p-6 shadow-md sm:p-8 lg:p-10">
                {content}
            </div>
        </div>
    );

    // Si falta email o token, no podemos seguir
    if (!token || !email) {
        return (
            <>
                <Header />
                {renderCard(
                    <>
                        <h1 className="mb-2 text-xl font-semibold sm:text-2xl">
                            Enlace no válido
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            El enlace de restablecimiento de contraseña no es válido o falta
                            información. Solicita un nuevo correo de restablecimiento.
                        </p>
                    </>
                )}
                <Footer />
            </>
        );
    }

    const onSubmit = async (data: ResetPasswordFormValues) => {
        try {
            setIsSubmitting(true);

            // 👇 3 argumentos, como define tu AuthContext
            await resetPassword(email, token, data.password);

            toast.success(
                "Tu contraseña se ha actualizado correctamente. Ya puedes iniciar sesión."
            );

            navigate("/");
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error resetting password:", error);
            toast.error(
                "No se ha podido actualizar la contraseña. Por favor, inténtalo de nuevo."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />

            {renderCard(
                <>
                    <div className="mb-6 sm:mb-8">
                        <h1 className="mb-1 text-xl font-semibold sm:text-2xl">
                            Restablecer contraseña
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Introduce tu nueva contraseña. Este enlace es válido por un tiempo
                            limitado, por motivos de seguridad.
                        </p>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-5 sm:space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">
                                            Nueva contraseña
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                autoComplete="new-password"
                                                className="h-10 text-sm sm:h-11"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">
                                            Confirma la nueva contraseña
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                autoComplete="new-password"
                                                className="h-10 text-sm sm:h-11"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="mt-2 w-full h-11 text-sm font-medium sm:h-12"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Actualizando contraseña...
                                    </>
                                ) : (
                                    "Actualizar contraseña"
                                )}
                            </Button>
                        </form>
                    </Form>
                </>
            )}

            <Footer />
        </>
    );
};

export default ResetPassword;
