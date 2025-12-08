import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

interface ResetPasswordFormProps {
    email: string;
    token: string;
    onSuccess?: () => void;
}

const ResetPasswordForm = ({ email, token, onSuccess }: ResetPasswordFormProps) => {
    const { resetPassword } = useAuth();

    const { register, handleSubmit, formState: { isSubmitting } } = useForm<{
        password: string;
        repeatPassword: string;
    }>({
        defaultValues: { password: "" }
    });

    const onSubmit = async ({ password, repeatPassword }: { password: string; repeatPassword: string; }) => {
        if (password !== repeatPassword) {
            throw new Error('Passwords does not match, please try again');
        } else {
            await resetPassword(email, token, password);
            onSuccess?.();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Nueva contraseña"
                {...register("password", { required: true })}
            />

            <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Repite la contraseña"
                {...register("repeatPassword", { required: true })}
            />

            <button
                type="submit"
                className="w-full bg-primary text-white p-2 rounded"
                disabled={isSubmitting}
            >
                Cambiar contraseña
            </button>
        </form>
    );
};

export default ResetPasswordForm;