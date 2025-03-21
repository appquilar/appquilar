
import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

/**
 * Lista de palabras para la animación del título
 */
const TOOL_TYPES = ['Herramientas', 'Eléctricas', 'Manuales', 'Maquinaria', 'Equipos', 'Accesorios'];

/**
 * Componente Hero para la página de inicio
 */
const Hero = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Efecto para la animación de palabras
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % TOOL_TYPES.length);
        setIsAnimating(false);
      }, 500); // Duración de la animación de desvanecimiento
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(wordInterval);
  }, []);

  return (
    <div className="pt-28 pb-10 px-4 sm:px-6 md:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-3 px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-xs font-medium uppercase tracking-wider">
            Alquila herramientas de calidad cuando las necesites
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6 animate-slide-down">
          La Forma Inteligente de Alquilar{' '}
          <span className={`inline-block text-primary transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {TOOL_TYPES[currentWordIndex]}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-down" style={{ animationDelay: '50ms' }}>
          Accede a equipos profesionales sin el costo de propiedad. Perfecto para proyectos DIY, eventos y trabajo profesional.
        </p>
        
        <div className="animate-slide-down" style={{ animationDelay: '100ms' }}>
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default Hero;
