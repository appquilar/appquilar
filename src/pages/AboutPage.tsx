import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {useSeo} from "@/hooks/useSeo.ts";

const AboutPage = () => {
    useSeo({
        type: "static",
        title: "Sobre Appquilar",
        description: "Conoce qué es Appquilar y nuestra misión.",
    });

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="mx-auto w-full max-w-4xl">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                        Quiénes somos
                    </h1>

                    <p className="mt-5 text-[15px] text-muted-foreground">
                        Appquilar es una plataforma para conectar personas que quieren alquilar cosas con
                        personas que las necesitan. Nuestro objetivo es que puedas acceder a artículos sin
                        tener que comprarlos, ahorrando dinero y reduciendo el desperdicio.
                    </p>

                    <h2 className="mt-10 text-xl font-semibold">Cómo funciona</h2>
                    <ul className="mt-4 space-y-2 text-muted-foreground">
                        <li>• Publica un artículo y define condiciones (precio, disponibilidad, entrega).</li>
                        <li>• Explora categorías y contacta directamente con el anunciante.</li>
                        <li>• Acordad la entrega/recogida y el uso del artículo.</li>
                    </ul>

                    <h2 className="mt-10 text-xl font-semibold">Nuestra filosofía</h2>
                    <p className="mt-4 text-muted-foreground">
                        Creemos en una economía más eficiente: reutilizar, compartir y sacar partido a lo que
                        ya existe.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
