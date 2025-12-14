import { SeoInfo } from "@/core/domain/SeoInfo";

export type SeoContext =
    | { type: "home" }
    | { type: "category"; name: string; slug: string }
    | { type: "product"; name: string; slug: string }
    | { type: "dashboard" }
    | { type: "dashboard-section"; section: string }
    | { type: "static"; title: string; description: string };

const BASE_URL = "https://appquilar.com";

export class SeoService {
    getSeo(context: SeoContext): SeoInfo {
        switch (context.type) {
            case "home":
                return {
                    title: "Appquilar · Alquila lo que necesitas",
                    description:
                        "Marketplace para alquilar productos de forma fácil, segura y sostenible.",
                    keywords: ["alquiler", "marketplace", "alquilar productos"],
                    ogTitle: "Appquilar · Alquila lo que necesitas",
                    ogDescription:
                        "Alquila productos sin comprarlos. Ahorra dinero y reduce residuos.",
                    twitterCard: "summary_large_image",
                    canonicalUrl: BASE_URL,
                };

            case "category":
                return {
                    title: `${context.name} en alquiler · Appquilar`,
                    description: `Encuentra productos de ${context.name} en alquiler cerca de ti.`,
                    keywords: ["alquiler", context.name],
                    ogTitle: `${context.name} en alquiler`,
                    ogDescription: `Descubre productos de ${context.name} disponibles en Appquilar.`,
                    canonicalUrl: `${BASE_URL}/categoria/${context.slug}`,
                };

            case "product":
                return {
                    title: `${context.name} · Alquiler en Appquilar`,
                    description: `Alquila ${context.name} de forma segura y sencilla.`,
                    keywords: ["alquiler", context.name],
                    ogTitle: context.name,
                    ogDescription: `Disponible para alquilar en Appquilar.`,
                    canonicalUrl: `${BASE_URL}/producto/${context.slug}`,
                };

            case "dashboard":
                return {
                    title: "Dashboard · Appquilar",
                    description: "Panel de gestión de Appquilar",
                    keywords: ["dashboard", "appquilar"],
                };

            case "dashboard-section":
                return {
                    title: `${context.section} · Dashboard · Appquilar`,
                    description: `Gestión de ${context.section.toLowerCase()} en Appquilar`,
                    keywords: ["dashboard", context.section],
                };

            case "static":
                return {
                    title: context.title,
                    description: context.description,
                    keywords: ["appquilar"],
                };
        }
    }
}
