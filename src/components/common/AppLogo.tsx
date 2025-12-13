import { useCallback, useState } from "react";

interface AppLogoProps {
    /**
     * Clase para el <img> cuando se renderiza el logo como imagen
     */
    imageClassName?: string;

    /**
     * Clase para el fallback de texto (si falla la imagen)
     */
    textClassName?: string;

    /**
     * Texto fallback. Por defecto "appquilar"
     */
    fallbackText?: string;

    /**
     * Alt text para accesibilidad. Por defecto "Appquilar"
     */
    alt?: string;

    /**
     * Ruta del logo en /public
     */
    src?: string;
}

const DEFAULT_SRC = "/appquilar-combined-orange.png";

const AppLogo = ({
                     imageClassName = "h-8 w-auto",
                     textClassName = "text-2xl font-display font-semibold tracking-tight text-primary",
                     fallbackText = "appquilar",
                     alt = "Appquilar",
                     src = DEFAULT_SRC,
                 }: AppLogoProps) => {
    const [hasError, setHasError] = useState(false);

    const handleError = useCallback(() => {
        setHasError(true);
    }, []);

    if (hasError) {
        return <span className={textClassName}>{fallbackText}</span>;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={imageClassName}
            onError={handleError}
        />
    );
};

export default AppLogo;
