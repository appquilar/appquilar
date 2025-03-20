
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

/**
 * Modal de autenticación con pestañas para inicio de sesión y registro
 */
const AuthModal = ({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
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
            <SignInForm onSuccess={handleSuccess} />
          ) : (
            <SignUpForm onSuccess={handleSuccess} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
