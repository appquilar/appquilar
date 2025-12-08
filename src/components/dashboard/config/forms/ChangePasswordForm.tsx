import {useForm} from "react-hook-form";
import {useAuth} from "@/context/AuthContext";

export const ChangePasswordForm = () => {
    const { changePassword, getCurrentSession } = useAuth();

    const { register, handleSubmit, formState } = useForm<{
        oldPassword: string;
        newPassword: string;
        repeatPassword: string;
    }>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            repeatPassword: ""
        }
    });

    const onSubmit = async (values: { oldPassword: string; newPassword: string; repeatPassword: string }) => {
        const session = await getCurrentSession();
        if (!session?.token) {
            throw new Error("No active session");
        }

        if (values.newPassword !== values.repeatPassword) {
            throw new Error("Passwords don't match");
        }

        await changePassword(values.oldPassword, values.newPassword);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
                type="password"
                placeholder="Contraseña actual"
                {...register("oldPassword", { required: true })}
                className="w-full border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Nueva contraseña"
                {...register("newPassword", { required: true })}
                className="w-full border p-2 rounded"
            />

            <input
                type="password"
                placeholder="Nueva contraseña"
                {...register("repeatPassword", { required: true })}
                className="w-full border p-2 rounded"
            />

            <button
                type="submit"
                disabled={formState.isSubmitting}
                className="w-full bg-primary text-white p-2 rounded"
            >
                Guardar cambios
            </button>
        </form>
    );
};
