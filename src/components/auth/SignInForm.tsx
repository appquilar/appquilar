import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useAuth} from "@/context/AuthContext";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {LoginCredentials} from "@/domain/models/AuthCredentials.ts";

const schema = z.object({
    email: z.string().email("Correo inválido"),
    password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

interface SignInFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
}

const SignInForm = ({ onSuccess, onForgotPassword }: SignInFormProps) => {
    const { login } = useAuth();
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginCredentials>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            await login(data.email, data.password);
            onSuccess?.();
        } catch {
            setErrorMsg("Credenciales incorrectas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>

                {errorMsg && (
                    <div className="p-2 rounded bg-orange-100 text-orange-700 text-sm">
                        {errorMsg}
                    </div>
                )}

                <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" placeholder={field.value ?? ""} />
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
                                <Input {...field} type="password" placeholder={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-primary hover:underline"
                >
                    ¿Olvidaste tu contraseña?
                </button>

                <Button disabled={isLoading} className="w-full" type="submit">
                    {isLoading ? "Iniciando..." : "Iniciar sesión"}
                </Button>
            </form>
        </Form>
    );
};

export default SignInForm;
