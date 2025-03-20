
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '@/context/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Placeholder categories - will be fetched from backend in production
const CATEGORIES: Category[] = [
  { id: '1', name: 'Power Tools', slug: 'power-tools' },
  { id: '2', name: 'Hand Tools', slug: 'hand-tools' },
  { id: '3', name: 'Gardening', slug: 'gardening' },
  { id: '4', name: 'Construction', slug: 'construction' },
  { id: '5', name: 'Event Equipment', slug: 'event-equipment' },
  { id: '6', name: 'Cleaning', slug: 'cleaning' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();

  // Handle scroll events to update header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 px-4 md:px-8 ${
          isScrolled 
            ? 'py-3 bg-background/95 backdrop-blur-md shadow-sm' 
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-display font-semibold tracking-tight text-primary transition-all duration-350"
          >
            RentTools
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="text-sm font-medium text-primary/80 hover:text-primary transition-colors duration-250"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions (Search, User) */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/search" 
              className="p-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            
            {isLoggedIn ? (
              <Link to="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover-lift flex items-center gap-2 font-medium"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">{user?.name || 'Account'}</span>
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="hover-lift font-medium"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg animate-fade-in md:hidden">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <Link 
                to="/" 
                className="text-2xl font-display font-semibold tracking-tight"
                onClick={() => setMobileMenuOpen(false)}
              >
                RentTools
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-6 text-lg">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="py-2 border-b border-border font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto pt-6 flex justify-center">
              {isLoggedIn ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">My Dashboard</Button>
                </Link>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
};

export default Header;
