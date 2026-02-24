import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {useSeo} from "@/hooks/useSeo.ts";

const TermsPage = () => {
    useSeo({
        type: "static",
        title: "Términos y condiciones de uso · Appquilar",
        description: "Términos y condiciones de uso en Appquilar.",
    });

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                        Términos y Condiciones
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Última actualización: 2025-08-16
                    </p>

                    <div className="mt-10 space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <section>
                            <p>
                                Estos términos regulan el acceso y uso de https://appquilar.com (el “Sitio”) y las
                                condiciones aplicables a la suscripción premium (modelo freemium). El Titular actúa
                                exclusivamente como intermediario entre usuarios y no participa en las transacciones
                                de alquiler entre arrendadores y arrendatarios.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">1. Registro de usuario</h2>
                            <p className="mt-3">
                                Para publicar o contactar, puede requerirse registro con datos veraces y una contraseña
                                bajo custodia del usuario. La edad mínima recomendada es de 14 años (o consentimiento de
                                padres/tutores si aplica).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">2. Funcionamiento y roles</h2>
                            <div className="mt-3 space-y-2">
                                <p>
                                    <span className="font-medium text-foreground">Arrendador:</span> publica artículos,
                                    fija condiciones y responde por su veracidad, licitud y estado.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Arrendatario:</span> contacta y, en su
                                    caso, formaliza el alquiler directamente con el arrendador.
                                </p>
                                <p>
                                    El Titular no es propietario de los artículos ni interviene en los pagos entre usuarios.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">3. Contenidos y artículos prohibidos</h2>
                            <p className="mt-3">
                                Queda prohibida la publicación de artículos ilícitos, peligrosos, falsificados o cuyo
                                alquiler esté restringido por normativa; así como contenidos que infrinjan derechos de
                                terceros. El Titular podrá moderar, ocultar o retirar anuncios y suspender cuentas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">4. Responsabilidad del usuario</h2>
                            <ul className="mt-3 space-y-2 list-disc pl-5">
                                <li>Veracidad y licitud de datos y anuncios.</li>
                                <li>Estado, seguridad y entrega/recogida de los artículos.</li>
                                <li>
                                    Cumplimiento de la normativa aplicable (consumo, garantías, seguridad de producto,
                                    fiscalidad, etc.).
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">5. Limitación de responsabilidad del Titular</h2>
                            <p className="mt-3">
                                El Titular no garantiza la disponibilidad continua del Sitio ni la ausencia de errores. No
                                responde por daños, pérdidas o incumplimientos derivados de relaciones entre usuarios, ni
                                por el uso indebido de la plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">
                                6. Suscripción Premium (condiciones de contratación)
                            </h2>
                            <div className="mt-3 space-y-2">
                                <p>
                                    <span className="font-medium text-foreground">Precio y facturación:</span> según se indique en el
                                    proceso de alta.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Periodicidad y renovación:</span> mensual/anual con
                                    renovación automática hasta cancelación.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Desistimiento (consumidores):</span> 14 días naturales
                                    desde la contratación. Si solicitas acceso inmediato a funcionalidades premium, aceptas que, si se
                                    presta el servicio durante el periodo de desistimiento, el reembolso podrá ser proporcional a la
                                    parte no disfrutada.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Cancelación:</span> efectiva para el siguiente periodo
                                    de facturación si se solicita antes de la fecha de renovación.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Botón con obligación de pago:</span> el flujo de
                                    contratación indicará claramente la aceptación del cargo y de estas condiciones.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Confirmación:</span> recibirás confirmación por email
                                    tras la contratación.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">7. Precios y modificaciones</h2>
                            <p className="mt-3">
                                Podemos actualizar precios o funcionalidades con aviso razonable. Los cambios no afectan al periodo ya
                                pagado.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">8. Propiedad intelectual</h2>
                            <p className="mt-3">
                                El usuario declara ser titular de los derechos necesarios sobre los contenidos que publique y concede al
                                Titular una licencia no exclusiva para mostrar dichos anuncios en el Sitio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">9. Notificaciones y contacto</h2>
                            <p className="mt-3">
                                Preferentemente por email a appquilar.contacto@gmail.com.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">10. Duración y terminación</h2>
                            <p className="mt-3">
                                Puedes cerrar tu cuenta en cualquier momento. Podemos suspender o terminar el servicio por incumplimientos,
                                uso fraudulento, riesgos de seguridad o requerimiento legal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">11. Protección de datos</h2>
                            <p className="mt-3">
                                El tratamiento de datos se rige por la Política de Privacidad.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">12. Ley aplicable y jurisdicción</h2>
                            <p className="mt-3">
                                Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los
                                Juzgados y Tribunales de <span className="font-medium text-foreground">Barcelona</span>, salvo norma imperativa
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

export default TermsPage;
