import React, { useMemo, useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import TrustDifferentiators from './TrustDifferentiators';
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
        <section className="animate-fade-in px-4 pb-12 sm:px-6 md:px-8">
            <div className="public-container text-center pt-0 md:pt-1">
                <div className="inline-block mb-3 px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-xs font-medium uppercase tracking-wider">
            Alquila lo que necesitas, cuando lo necesitas
          </span>
                </div>

                <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight mb-5 animate-slide-down">
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
                    className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-down"
                    style={{ animationDelay: '50ms' }}
                >
                    Accede a equipos profesionales sin el costo de propiedad. Perfecto para proyectos DIY, eventos y trabajo profesional.
                </p>

                <div className="animate-slide-down" style={{ animationDelay: '100ms' }}>
                    <SearchBar />
                </div>
            </div>

            <div className="mt-8 -mx-4 sm:-mx-6 md:-mx-8">
                <TrustDifferentiators />
            </div>
        </section>
    );
};

export default Hero;
