import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/Home/Hero';
import TrustDifferentiators from '@/components/Home/TrustDifferentiators';
import CategoryGrid from '@/components/Home/CategoryGrid';
import FeaturedProducts from '@/components/Home/FeaturedProducts';
import FaqSection from '@/components/Home/FaqSection';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import {useSeo} from "@/hooks/useSeo.ts";

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
    useSeo({ type: "home" });

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 public-main">
                <Hero />
                <TrustDifferentiators />
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
