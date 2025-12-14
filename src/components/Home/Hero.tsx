import React, { useMemo, useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { usePublicSiteCategories } from "@/application/hooks/usePublicSiteCategories";

/**
 * Componente Hero para la página de inicio
 */
const Hero = () => {
    const { rotatingCategories, isLoading } = usePublicSiteCategories();

    const palabras = useMemo(() => {
        if (!isLoading && rotatingCategories.length > 0) {
            return rotatingCategories.map((c) => c.name);
        }

        // fallback visual mientras carga o si está vacío
        return ['Herramientas', 'Jardinería', 'Eventos', 'Limpieza'];
    }, [isLoading, rotatingCategories]);

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Efecto para la animación de palabras
    useEffect(() => {
        const wordInterval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentWordIndex((prevIndex) => (prevIndex + 1) % palabras.length);
                setIsAnimating(false);
            }, 500);
        }, 3000);

        return () => clearInterval(wordInterval);
    }, [palabras.length]);

    return (
        <div className="pt-28 pb-10 px-4 sm:px-6 md:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-3 px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-xs font-medium uppercase tracking-wider">
            Alquila lo que necesitas, cuando lo necesitas
          </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6 animate-slide-down">
                    La Forma Inteligente de Alquilar{' '}
                    <span
                        className={`inline-block text-primary transition-opacity duration-500 ${
                            isAnimating ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
            {palabras[currentWordIndex]}
          </span>
                </h1>

                <p
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-down"
                    style={{ animationDelay: '50ms' }}
                >
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
