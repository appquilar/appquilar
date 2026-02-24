import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {useSeo} from "@/hooks/useSeo.ts";

const LegalNoticePage = () => {
    useSeo({
        type: "static",
        title: "Aviso Legal · Appquilar",
        description: "Información legal en Appquilar.",
    });

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                        Aviso Legal
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Última actualización: 2025-08-16
                    </p>

                    <div className="mt-10 space-y-8 text-sm md:text-base leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold">1. Identificación del Titular</h2>
                            <div className="mt-3 text-muted-foreground space-y-1">
                                <p>
                                    <span className="font-medium text-foreground">Titular:</span> Appquilar
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Domicilio:</span> Mataró
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Email:</span>{" "}
                                    appquilar.contacto@gmail.com
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Dominio:</span>{" "}
                                    https://appquilar.com
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">2. Objeto del Sitio</h2>
                            <p className="mt-3 text-muted-foreground">
                                El sitio web https://appquilar.com (en adelante, el &quot;Sitio&quot;) ofrece una
                                plataforma de intermediación para la publicación y búsqueda de artículos en alquiler.
                                El titular no es parte en las transacciones de alquiler entre usuarios ni gestiona
                                los pagos entre arrendador y arrendatario.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">3. Condiciones de Uso</h2>
                            <p className="mt-3 text-muted-foreground">
                                El acceso y uso del Sitio implica la aceptación de este Aviso Legal y del resto de
                                textos legales. El usuario se compromete a un uso lícito, diligente y conforme a la
                                normativa vigente.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">4. Propiedad Intelectual e Industrial</h2>
                            <p className="mt-3 text-muted-foreground">
                                Salvo indicación expresa, los contenidos del Sitio (textos, imágenes, logotipos,
                                software, diseño) pertenecen al Titular o a terceros licenciantes. Queda prohibida
                                su reproducción, distribución o comunicación pública sin autorización.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">5. Enlaces</h2>
                            <p className="mt-3 text-muted-foreground">
                                Los enlaces a sitios de terceros se facilitan para conveniencia. El Titular no
                                responde de sus contenidos ni de daños derivados de su uso.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">6. Exclusión de Responsabilidad</h2>
                            <p className="mt-3 text-muted-foreground">
                                El Titular no garantiza la veracidad de la información proporcionada por usuarios ni
                                el estado/seguridad de los artículos anunciados. Cualquier operación entre usuarios
                                se realiza bajo su exclusiva responsabilidad.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">7. Disponibilidad y Seguridad</h2>
                            <p className="mt-3 text-muted-foreground">
                                El Titular procura la continuidad del servicio y la seguridad del Sitio, sin
                                garantizar la ausencia de interrupciones o elementos maliciosos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold">8. Ley Aplicable y Jurisdicción</h2>
                            <p className="mt-3 text-muted-foreground">
                                Este Aviso Legal se rige por la legislación española. Para cualquier controversia,
                                las partes se someten a los Juzgados y Tribunales de España, salvo norma imperativa
                                en contrario.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LegalNoticePage;
