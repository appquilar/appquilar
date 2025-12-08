import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";

import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">(
        "signin",
    );

    useEffect(() => {
        if (isOpen) {
            setActiveTab("signin");
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
                {/* Header accesible (no visible) */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Autenticación</DialogTitle>
                    <DialogDescription>
                        Cuadro de diálogo para iniciar sesión, registrarse o recuperar tu
                        contraseña.
                    </DialogDescription>
                </DialogHeader>

                {/* TAB HEADERS — sólo login/registro */}
                {activeTab !== "forgot" && (
                    <div className="flex items-center border-b border-border">
                        <button
                            className={`flex-1 py-4 text-center transition-colors ${
                                activeTab === "signin"
                                    ? "text-primary font-medium bg-secondary/50"
                                    : "text-muted-foreground hover:text-primary"
                            }`}
                            onClick={() => setActiveTab("signin")}
                        >
                            Iniciar sesión
                        </button>

                        <button
                            className={`flex-1 py-4 text-center transition-colors ${
                                activeTab === "signup"
                                    ? "text-primary font-medium bg-secondary/50"
                                    : "text-muted-foreground hover:text-primary"
                            }`}
                            onClick={() => setActiveTab("signup")}
                        >
                            Registrarse
                        </button>
                    </div>
                )}

                <div className="px-6 py-6">
                    {activeTab === "signin" && (
                        <SignInForm
                            onSuccess={onClose}
                            onForgotPassword={() => setActiveTab("forgot")}
                        />
                    )}

                    {activeTab === "signup" && (
                        <SignUpForm onSuccess={() => setActiveTab("signin")} />
                    )}

                    {activeTab === "forgot" && (
                        <ForgotPasswordForm
                            onBack={() => setActiveTab("signin")}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
