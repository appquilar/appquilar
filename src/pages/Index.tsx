import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/Home/Hero';
import CategoryGrid from '@/components/Home/CategoryGrid';
import FeaturedProducts from '@/components/Home/FeaturedProducts';
import FaqSection from '@/components/Home/FaqSection';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useSeo } from "@/hooks/useSeo";
import { buildAbsolutePublicUrl } from '@/domain/config/publicRoutes';

const SectionDivider = () => (
    <div className="public-section !py-0" aria-hidden="true">
        <div className="public-container border-t border-border/70" />
    </div>
);

/**
 * Página principal de la aplicación
 */
const Index = () => {
    useScrollToTop();
    useSeo({
        title: "Appquilar | Marketplace de alquiler en España",
        description:
            "Alquila herramientas, equipamiento y productos cerca de ti con Appquilar. Encuentra categorías, compara opciones y accede a lo que necesitas sin comprarlo.",
        canonicalUrl: buildAbsolutePublicUrl("/"),
        keywords: ["marketplace de alquiler", "alquiler de herramientas", "alquiler de productos", "Appquilar"],
        jsonLd: [
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Appquilar",
                url: buildAbsolutePublicUrl("/"),
                logo: buildAbsolutePublicUrl("/appquilar-combined-orange.png"),
            },
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Appquilar",
                url: buildAbsolutePublicUrl("/"),
                inLanguage: "es-ES",
            },
        ],
    });

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 public-main">
                <Hero />
                <CategoryGrid />
                <SectionDivider />
                <FeaturedProducts />
                <SectionDivider />
                <FaqSection />
            </main>
            <Footer />
        </div>
    );
};

export default Index;
