import { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import AppLogo from "@/components/common/AppLogo";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">(
        "signin",
    );

    /**
     * Mensaje informativo que se muestra sobre el formulario de login.
     * Se usa para:
     * - Contraseña cambiada (vía dashboard)
     * - Registro correcto
     * - Envío de email de recuperación
     */
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Siempre abrimos en login
            setActiveTab("signin");

            // Leer mensaje informativo (si existe)
            const infoMessageFromSession =
                sessionStorage.getItem("auth:infoMessage") ??
                sessionStorage.getItem("auth:postChangePasswordMessage");

            if (infoMessageFromSession) {
                setInfoMessage(infoMessageFromSession);
                sessionStorage.removeItem("auth:infoMessage");
                sessionStorage.removeItem("auth:postChangePasswordMessage");
            } else {
                // Si abrimos "normal", limpiamos cualquier mensaje anterior
                setInfoMessage(null);
            }
        } else {
            // Al cerrar el modal limpiamos el mensaje
            setInfoMessage(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="auth-modal-content w-[92vw] max-w-[450px] overflow-hidden rounded-[18px] border border-border/70 bg-white p-0 shadow-[0_24px_60px_rgba(15,23,42,0.16)] duration-150 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button]:hidden">
                {/* Header accesible (no visible) */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Autenticación</DialogTitle>
                    <DialogDescription>
                        Cuadro de diálogo para iniciar sesión, registrarse o recuperar tu
                        contraseña.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[88vh] overflow-y-auto">
                    <div className="sticky top-0 z-20 border-b border-border/70 bg-white/95 backdrop-blur-md">
                        <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
                            <div className="min-w-0">
                                <div className="mb-2">
                                    <AppLogo imageClassName="h-7 w-auto" textClassName="text-lg font-display font-semibold tracking-tight text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">Accede a tu cuenta</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Gestiona tus alquileres, mensajes y perfil.
                                </p>
                            </div>

                            <DialogClose asChild>
                                <button
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-white text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    aria-label="Cerrar"
                                >
                                    <X size={16} />
                                </button>
                            </DialogClose>
                        </div>

                        <div className="px-5 pb-4">
                            <div className="grid grid-cols-3 rounded-xl border border-border/70 bg-muted/40 p-1">
                                <button
                                    type="button"
                                    className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === "signin"
                                            ? "bg-white text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() => setActiveTab("signin")}
                                >
                                    Iniciar sesión
                                </button>

                                <button
                                    type="button"
                                    className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === "signup"
                                            ? "bg-white text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() => setActiveTab("signup")}
                                >
                                    Registrarse
                                </button>

                                <button
                                    type="button"
                                    className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === "forgot"
                                            ? "bg-white text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    onClick={() => setActiveTab("forgot")}
                                >
                                    Recuperar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 pb-5 pt-4">
                        {activeTab === "signin" && (
                            <SignInForm
                                onSuccess={onClose}
                                onForgotPassword={() => setActiveTab("forgot")}
                                infoMessage={infoMessage}
                            />
                        )}

                        {activeTab === "signup" && (
                            <SignUpForm
                                onSuccess={() => {
                                    // Volvemos a login y mostramos mensaje
                                    setActiveTab("signin");
                                    setInfoMessage(
                                        "Tu cuenta se ha creado correctamente. Ahora puedes iniciar sesión con tu correo y contraseña.",
                                    );
                                }}
                            />
                        )}

                        {activeTab === "forgot" && (
                            <ForgotPasswordForm
                                onBack={() => setActiveTab("signin")}
                                onSuccess={() => {
                                    // Tras enviar el email, volvemos al login con mensaje
                                    setActiveTab("signin");
                                    setInfoMessage(
                                        "Te hemos enviado un correo con instrucciones para restablecer tu contraseña.",
                                    );
                                }}
                            />
                        )}

                        <div className="mt-5 border-t border-border/70 pt-4 text-center text-xs text-muted-foreground">
                            {activeTab === "signin" ? (
                                <>
                                    ¿No tienes cuenta?{" "}
                                    <button
                                        type="button"
                                        className="font-medium text-primary hover:underline"
                                        onClick={() => setActiveTab("signup")}
                                    >
                                        Regístrate
                                    </button>
                                </>
                            ) : activeTab === "signup" ? (
                                <>
                                    ¿Ya tienes cuenta?{" "}
                                    <button
                                        type="button"
                                        className="font-medium text-primary hover:underline"
                                        onClick={() => setActiveTab("signin")}
                                    >
                                        Inicia sesión
                                    </button>
                                </>
                            ) : (
                                <>
                                    ¿Recuerdas tu contraseña?{" "}
                                    <button
                                        type="button"
                                        className="font-medium text-primary hover:underline"
                                        onClick={() => setActiveTab("signin")}
                                    >
                                        Volver al acceso
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
