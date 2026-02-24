import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {useSeo} from "@/hooks/useSeo.ts";

const CookiesPage = () => {
    useSeo({
        type: "static",
        title: "Política de cookies · Appquilar",
        description: "Información legal sobre cookies en Appquilar.",
    });

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                        Política de Cookies
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Última actualización: 2025-08-16
                    </p>

                    <div className="mt-10 space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <section>
                            <p>
                                Esta Política de Cookies describe el uso de cookies y tecnologías similares en
                                https://appquilar.com.
                            </p>
                            <p className="mt-3">
                                Puedes gestionar tu consentimiento desde el enlace “Preferencias de cookies” del pie
                                de página (si está disponible en tu versión actual del sitio).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">1. ¿Qué son las cookies?</h2>
                            <p className="mt-3">
                                Son archivos o dispositivos que se descargan en tu navegador para almacenar y
                                recuperar información. Pueden ser técnicas (necesarias), de preferencia, analíticas
                                o de marketing.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">2. Cookies que utilizamos</h2>
                            <div className="mt-3 space-y-3">
                                <p>
                  <span className="font-medium text-foreground">
                    Técnicas/estrictamente necesarias (siempre activas):
                  </span>{" "}
                                    imprescindibles para el funcionamiento básico (por ejemplo, iniciar sesión,
                                    seguridad, balanceo de carga).
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Analíticas (Google Analytics 4):</span>{" "}
                                    nos ayudan a entender el uso del Sitio y mejorar prestaciones. Se instalan solo con
                                    tu consentimiento.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Marketing (Meta/Facebook Pixel):</span>{" "}
                                    permiten personalizar publicidad y medir campañas. Se instalan solo con tu
                                    consentimiento.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">3. Gestión del consentimiento</h2>
                            <p className="mt-3">
                                Al acceder al Sitio podemos mostrar un banner para aceptar, rechazar o configurar
                                las cookies no esenciales. Puedes modificar o revocar tu consentimiento en cualquier
                                momento desde “Preferencias de cookies” (si está disponible).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">4. Proveedores de terceros</h2>
                            <div className="mt-3 space-y-3">
                                <p>
                                    <span className="font-medium text-foreground">Google Analytics 4</span> (Google
                                    Ireland Ltd.). Finalidad: analítica. Más información: política de privacidad de
                                    Google.
                                </p>
                                <p>
                                    <span className="font-medium text-foreground">Meta Pixel</span> (Meta Platforms
                                    Ireland Ltd.). Finalidad: marketing/remarketing y medición. Más información:
                                    cookies y privacidad de Meta.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">
                                5. Cómo deshabilitar cookies en tu navegador
                            </h2>
                            <p className="mt-3">
                                Puedes bloquear o eliminar cookies desde la configuración de tu navegador (Chrome,
                                Firefox, Safari, Edge…). Consulta su ayuda/soporte para los pasos actualizados.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">6. Transferencias internacionales</h2>
                            <p className="mt-3">
                                El uso de Google y Meta puede implicar transferencias internacionales de datos fuera
                                del EEE. Aplicaremos cláusulas contractuales tipo u otros mecanismos conforme al RGPD.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">7. Actualizaciones</h2>
                            <p className="mt-3">
                                Podremos actualizar esta Política para reflejar cambios técnicos o legales. Fecha de
                                última actualización: 2025-08-16.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground">8. Contacto</h2>
                            <p className="mt-3">
                                Si tienes dudas, escríbenos a appquilar.contacto@gmail.com.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CookiesPage;
