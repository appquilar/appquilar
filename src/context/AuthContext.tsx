
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'company_admin' | 'company_user';
  companyId?: string;
  companyName?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeToCompany: (companyName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data - will be replaced with actual authentication
const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Smith',
  email: 'john@example.com',
  role: 'user'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we would validate credentials with a backend
    // For demo, we'll just pretend it worked
    if (email && password) {
      setUser(MOCK_USER);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we would create an account with a backend
    // For demo, we'll just pretend it worked
    if (name && email && password) {
      const newUser = { ...MOCK_USER, name, email };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      throw new Error('Invalid information');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const upgradeToCompany = async (companyName: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (user && companyName) {
      const updatedUser: User = {
        ...user,
        role: 'company_admin',
        companyId: 'company-1',
        companyName
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      throw new Error('Unable to upgrade account');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn: !!user, 
        user, 
        isLoading,
        login,
        signup,
        logout,
        upgradeToCompany
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
