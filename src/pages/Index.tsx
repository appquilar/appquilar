import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/Home/Hero';
import CategoryGrid from '@/components/Home/CategoryGrid';
import FeaturedProducts from '@/components/Home/FeaturedProducts';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import {useSeo} from "@/hooks/useSeo.ts";

/**
 * Página principal de la aplicación
 */
const Index = () => {
    useScrollToTop();
    useSeo({ type: "home" });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <CategoryGrid />
                <FeaturedProducts />
            </main>
            <Footer />
        </div>
    );
};

export default Index;
