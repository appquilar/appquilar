
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface SignUpFormProps {
  onSuccess: () => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(name, email, password);
      toast.success('Account created successfully');
      onSuccess();
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Full Name
        </label>
        <Input
          id="name"
          placeholder="John Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      <div className="flex items-start space-x-2 mt-4">
        <Checkbox 
          id="terms" 
          checked={acceptTerms} 
          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          disabled={isSubmitting}
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal">
          I agree to the{' '}
          <a 
            href="/terms" 
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a 
            href="/privacy" 
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          type="button"
          className="hover-lift"
          disabled={isSubmitting}
        >
          Google
        </Button>
        <Button 
          variant="outline" 
          type="button"
          className="hover-lift"
          disabled={isSubmitting}
        >
          Facebook
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
