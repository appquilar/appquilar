import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {useSeo} from "@/hooks/useSeo.ts";
import { buildAbsolutePublicUrl } from "@/domain/config/publicRoutes";

const NotFound = () => {
    useSeo({
        title: "Página no encontrada · Appquilar",
        description: "La página que buscas no existe.",
        canonicalUrl: buildAbsolutePublicUrl("/404"),
        robots: "noindex,follow",
    });
    const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">La pagina que buscas no existe.</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
