import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

interface ForgotPasswordFormProps {
    onBackToLoginWithMessage: () => void;
}

const ForgotPasswordForm = ({ onBackToLoginWithMessage }: ForgotPasswordFormProps) => {
    const { requestPasswordReset } = useAuth();

    const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>({
        defaultValues: { email: "" },
    });

    const onSubmit = async ({ email }: { email: string }) => {
        await requestPasswordReset(email);
        onBackToLoginWithMessage();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Tu email"
                {...register("email", { required: true })}
            />

            <button
                type="submit"
                className="w-full bg-primary text-white p-2 rounded"
                disabled={isSubmitting}
            >
                Enviar enlace
            </button>
        </form>
    );
};

export default ForgotPasswordForm;
