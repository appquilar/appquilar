
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'forgot';
}

/**
 * Modal de autenticación con pestañas para inicio de sesión y registro
 */
const AuthModal = ({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>(defaultTab);

  const handleSuccess = () => {
    onClose();
  };

  // Muestra solo las pestañas principales y maneja la recuperación de contraseña como subpágina
  const showForgotPassword = activeTab === 'forgot';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
        {!showForgotPassword ? (
          <>
            <div className="flex items-center border-b border-border">
              <button
                className={`flex-1 py-4 text-center transition-colors ${
                  activeTab === 'signin' 
                    ? 'text-primary font-medium bg-secondary/50' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
                onClick={() => setActiveTab('signin')}
              >
                Iniciar Sesión
              </button>
              <button
                className={`flex-1 py-4 text-center transition-colors ${
                  activeTab === 'signup' 
                    ? 'text-primary font-medium bg-secondary/50' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
                onClick={() => setActiveTab('signup')}
              >
                Registrarse
              </button>
            </div>

            <div className="px-6 py-6">
              {activeTab === 'signin' ? (
                <SignInForm 
                  onSuccess={handleSuccess} 
                  onForgotPassword={() => setActiveTab('forgot')} 
                />
              ) : (
                <SignUpForm onSuccess={handleSuccess} />
              )}
            </div>
          </>
        ) : (
          <div className="px-6 py-6">
            <ForgotPasswordForm 
              onBack={() => setActiveTab('signin')} 
              onSuccess={() => {
                setActiveTab('signin');
              }} 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
