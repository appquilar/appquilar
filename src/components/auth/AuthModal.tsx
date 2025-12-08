import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

const AuthModal = ({ isOpen, onClose, defaultTab = "signin" }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [forgotMessageVisible, setForgotMessageVisible] = useState(false);

    const showForgotMessage = () => {
        setForgotMessageVisible(true);
        setActiveTab("signin");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">

                {/* Header */}
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

                <div className="px-6 py-6 space-y-4">

                    {/* Mensaje amarillo si viene de forgot password */}
                    {forgotMessageVisible && activeTab === "signin" && (
                        <div className="rounded-lg p-4 bg-[#FFF9DB] text-[#8B4513]">
                            <p className="font-semibold uppercase text-sm mb-1">Importante</p>
                            <p className="text-sm">
                                Te hemos enviado un correo con instrucciones para restablecer
                                tu contraseña. Este enlace solo será válido durante un periodo
                                limitado o hasta que lo utilices una vez.
                            </p>
                        </div>
                    )}

                    {activeTab === "signin" && (
                        <SignInForm
                            onSuccess={onClose}
                            onForgotPassword={() => setActiveTab("forgot")}
                        />
                    )}

                    {activeTab === "signup" && (
                        <SignUpForm
                            onSuccess={() => setActiveTab("signin")}
                        />
                    )}

                    {activeTab === "forgot" && (
                        <ForgotPasswordForm
                            onBackToLoginWithMessage={showForgotMessage}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
