import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

const ResetPasswordPage = () => {
    const { resetPassword } = useAuth();
    const [params] = useSearchParams();
    const email = params.get("email") ?? "";
    const token = params.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== repeatPassword) {
            setError("Las contraseñas no coinciden. Por favor, asegúrate de que ambas sean iguales.");
            return;
        }

        try {
            await resetPassword(email, token, password);
            setSuccess(true);
        } catch (e) {
            setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
        }
    };

    return (
        <>
            <Header />

            <div className="max-w-md mx-auto mt-24 mb-16 p-6 bg-white shadow rounded-lg space-y-6">
                <h1 className="text-2xl font-bold text-center">Restablecer Contraseña</h1>

                {error && (
                    <div className="rounded-lg p-4 bg-[#FFF9DB] text-[#8B4513]">
                        <p className="font-semibold uppercase text-sm mb-1">Importante</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {success ? (
                    <div className="rounded-lg p-4 bg-green-100 text-green-800 text-center">
                        <p className="font-semibold">Contraseña actualizada correctamente</p>
                        <p className="text-sm mt-1">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="font-medium">Nueva contraseña</label>
                            <input
                                type="password"
                                className="w-full border p-2 rounded"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Repetir contraseña</label>
                            <input
                                type="password"
                                className="w-full border p-2 rounded"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white p-2 rounded font-medium"
                        >
                            Cambiar contraseña
                        </button>
                    </form>
                )}
            </div>

            <Footer />
        </>
    );
};

export default ResetPasswordPage;
