
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Categorías de ejemplo - en producción se obtendrían del backend
const CATEGORIES: Category[] = [
  { id: '1', name: 'Herramientas Eléctricas', slug: 'power-tools' },
  { id: '2', name: 'Herramientas Manuales', slug: 'hand-tools' },
  { id: '3', name: 'Jardinería', slug: 'gardening' },
  { id: '4', name: 'Construcción', slug: 'construction' },
  { id: '5', name: 'Equipamiento para Eventos', slug: 'event-equipment' },
  { id: '6', name: 'Limpieza', slug: 'cleaning' },
];

/**
 * Componente de cabecera principal de la aplicación
 */
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  // Manejar eventos de scroll para actualizar la apariencia del encabezado
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

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
            appquilar
          </Link>

          {/* Navegación Desktop */}
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

          {/* Acciones (Búsqueda, Usuario) */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/search" 
              className="p-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} />
            </Link>
            
            {isLoggedIn ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 font-medium hover:bg-accent transition-colors"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline">{user?.name || 'Cuenta'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-56" align="end">
                  <div className="p-3 border-b">
                    <p className="font-medium">¡Hola, {user?.name || 'Usuario'}!</p>
                  </div>
                  <div className="p-1">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md w-full text-sm"
                    >
                      <LayoutDashboard size={16} />
                      <span>Panel de Control</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md w-full text-left text-destructive text-sm"
                    >
                      <LogOut size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-accent transition-colors font-medium"
                onClick={() => setAuthModalOpen(true)}
              >
                Iniciar Sesión
              </Button>
            )}
            
            {/* Botón de menú móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menú"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg animate-fade-in md:hidden">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <Link 
                to="/" 
                className="text-2xl font-display font-semibold tracking-tight"
                onClick={() => setMobileMenuOpen(false)}
              >
                appquilar
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
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
                  <Button className="w-full">Mi Panel</Button>
                </Link>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
};

export default Header;
