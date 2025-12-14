import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {useSeo} from "@/hooks/useSeo.ts";

const PARTNERS_EMAIL = "appquilar.contacto@gmail.com";

const PartnersPage = () => {
    useSeo({
        type: "static",
        title: "Partners · Appquilar",
        description: "Empresas y colaboradores de Appquilar.",
    });
    const [company, setCompany] = useState("");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [type, setType] = useState("Colaboración");
    const [message, setMessage] = useState("");

    const mailtoHref = useMemo(() => {
        const subject = encodeURIComponent(`[Partners] ${company || "Empresa"}`);
        const body = encodeURIComponent(
            `Empresa: ${company}\nContacto: ${contactName}\nEmail: ${email}\nCiudad: ${city}\nTipo: ${type}\n\nMensaje:\n${message}\n`
        );
        return `mailto:${PARTNERS_EMAIL}?subject=${subject}&body=${body}`;
    }, [company, contactName, email, city, type, message]);

    const disabled = !company.trim() || !email.trim() || !message.trim();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-24 px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
                        Colabora con nosotros
                    </h1>

                    <p className="mt-4 text-muted-foreground">
                        Si eres una empresa y quieres colaborar con Appquilar, rellena este formulario y
                        te contactamos.
                    </p>

                    <div className="mt-8 space-y-4">
                        <div>
                            <label className="text-sm font-medium">Empresa</label>
                            <input
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                placeholder="Nombre de la empresa"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Persona de contacto</label>
                            <input
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                placeholder="Nombre y apellidos"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="empresa@email.com"
                                    type="email"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Ciudad</label>
                                <input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="Mataró / Barcelona / ..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option>Colaboración</option>
                                <option>Tienda / Partner local</option>
                                <option>Proveedor</option>
                                <option>Seguros / Garantías</option>
                                <option>Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Mensaje</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="mt-2 w-full min-h-[140px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                                placeholder="Cuéntanos qué necesitas o cómo te gustaría colaborar"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <a href={mailtoHref}>
                                <Button disabled={disabled}>Enviar solicitud</Button>
                            </a>
                            <span className="text-xs text-muted-foreground">(Se abrirá tu app de email)</span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Este formulario es una versión MVP. Más adelante lo conectamos a un endpoint.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PartnersPage;
