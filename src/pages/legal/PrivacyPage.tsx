import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {useSeo} from "@/hooks/useSeo.ts";

const PrivacyPage = () => {
    useSeo({
        type: "static",
        title: "Política de privacidad · Appquilar",
        description: "Política de privacidad en Appquilar.",
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-24 px-4 sm:px-6 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
                        Política de Privacidad
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Última actualización: 2025-08-16
                    </p>

                    <div className="mt-10 space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground">1. Responsable del tratamiento</h2>
                            <div className="mt-3 space-y-1">
                                <p>
                                    <span className="font-medium text-foreground">Responsable:</span> Appquilar
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Domicilio:</span> Mataró
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Email:</span> appquilar.contacto@gmail.com
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Sitio web:</span> https://appquilar.com
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">2. Datos que tratamos</h2>
                            <ul className="mt-3 space-y-2 list-disc pl-5">
                                <li>Datos de cuenta: email, nombre/apellidos (si se facilitan), credenciales (hash).</li>
                                <li>Datos de uso: actividad dentro del Sitio (por ejemplo, navegación y acciones básicas).</li>
                                <li>Datos de contacto: los que envíes mediante formularios o email.</li>
                                <li>
                                    Datos técnicos: IP, identificadores de sesión, información del navegador/dispositivo, necesarios para seguridad
                                    y funcionamiento.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">3. Finalidades</h2>
                            <ul className="mt-3 space-y-2 list-disc pl-5">
                                <li>Prestar el servicio: registro, autenticación y gestión de cuenta.</li>
                                <li>Permitir la publicación/consulta de anuncios y la interacción entre usuarios.</li>
                                <li>Atención al usuario: responder consultas y comunicaciones.</li>
                                <li>Seguridad: prevención de fraude, abuso y uso indebido.</li>
                                <li>
                                    Analítica y marketing (solo con consentimiento si corresponde): medición y mejora del servicio, campañas.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">4. Base jurídica</h2>
                            <ul className="mt-3 space-y-2 list-disc pl-5">
                                <li>
                                    <span className="font-medium text-foreground">Ejecución de un contrato</span> (o medidas precontractuales): para
                                    prestar la plataforma y gestionar la cuenta.
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Interés legítimo</span>: seguridad del Sitio y prevención de fraude.
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Consentimiento</span>: cookies no esenciales, analítica/marketing cuando aplique.
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Obligación legal</span>: cuando sea necesario por normativa aplicable.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">5. Conservación</h2>
                            <p className="mt-3">
                                Conservamos los datos durante el tiempo necesario para prestar el servicio y cumplir obligaciones legales.
                                Podremos conservar información mínima bloqueada cuando sea necesario para cumplir responsabilidades legales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">6. Destinatarios</h2>
                            <p className="mt-3">
                                No cedemos datos a terceros salvo obligación legal o cuando sea necesario para prestar el servicio mediante proveedores
                                (encargados de tratamiento) que actúan bajo nuestras instrucciones.
                            </p>
                            <p className="mt-3">
                                Si se activan herramientas de analítica/marketing (p. ej. Google Analytics 4 o Meta Pixel), se aplicará lo descrito en
                                la Política de Cookies y se solicitará consentimiento cuando corresponda.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">7. Transferencias internacionales</h2>
                            <p className="mt-3">
                                Algunos proveedores pueden tratar datos fuera del EEE. En ese caso aplicaremos cláusulas contractuales tipo u otros
                                mecanismos válidos conforme al RGPD.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">8. Derechos</h2>
                            <p className="mt-3">
                                Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a
                                appquilar.contacto@gmail.com. También puedes presentar una reclamación ante la AEPD.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">9. Seguridad</h2>
                            <p className="mt-3">
                                Aplicamos medidas razonables para proteger la información, aunque no podemos garantizar seguridad absoluta en internet.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">10. Cambios en esta política</h2>
                            <p className="mt-3">
                                Podremos actualizar esta Política de Privacidad para reflejar cambios técnicos o legales. Indicaremos la fecha de última
                                actualización.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
