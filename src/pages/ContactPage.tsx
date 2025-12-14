import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {useSeo} from "@/hooks/useSeo.ts";

const CONTACT_EMAIL = "appquilar.contacto@gmail.com";

type Topic = "Soporte" | "Colaboración" | "Legal" | "Prensa" | "Otro";

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const ContactPage = () => {
    useSeo({
        type: "static",
        title: "Contacto · Appquilar",
        description: "Contacta con el equipo de Appquilar.",
    });
    const [topic, setTopic] = useState<Topic>("Soporte");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        message: false,
    });

    const errors = useMemo(() => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Indica tu nombre.";
        if (!email.trim()) e.email = "Indica tu email.";
        else if (!isEmail(email)) e.email = "Email no válido.";
        if (!message.trim() || message.trim().length < 10)
            e.message = "Cuéntanos un poco más (mín. 10 caracteres).";
        return e;
    }, [name, email, message]);

    const isValid = Object.keys(errors).length === 0;

    const mailtoHref = useMemo(() => {
        const subject = encodeURIComponent(`[Contacto - ${topic}] ${name || "Usuario"}`);
        const body = encodeURIComponent(
            `Tema: ${topic}\nNombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}\n`
        );
        return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    }, [topic, name, email, message]);

    const markAllTouched = () =>
        setTouched({ name: true, email: true, message: true });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-24 px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
                        Contacto
                    </h1>
                    <p className="mt-4 text-muted-foreground">
                        Escríbenos y te responderemos lo antes posible.
                    </p>

                    <div className="mt-10 rounded-xl border border-border bg-background p-6 md:p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tema */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Tema</label>
                                <select
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value as Topic)}
                                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                >
                                    <option>Soporte</option>
                                    <option>Colaboración</option>
                                    <option>Legal</option>
                                    <option>Prensa</option>
                                    <option>Otro</option>
                                </select>
                            </div>

                            {/* Nombre */}
                            <div>
                                <label className="text-sm font-medium">Nombre</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="Tu nombre"
                                />
                                {touched.name && errors.name ? (
                                    <p className="mt-2 text-xs text-destructive">{errors.name}</p>
                                ) : null}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="tu@email.com"
                                    type="email"
                                />
                                {touched.email && errors.email ? (
                                    <p className="mt-2 text-xs text-destructive">{errors.email}</p>
                                ) : null}
                            </div>

                            {/* Mensaje */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Mensaje</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                                    className="mt-2 w-full min-h-[160px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="¿En qué podemos ayudarte?"
                                />
                                {touched.message && errors.message ? (
                                    <p className="mt-2 text-xs text-destructive">{errors.message}</p>
                                ) : (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Mínimo 10 caracteres.
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                                <div className="text-xs text-muted-foreground">
                                    En esta versión MVP el envío abre tu app de email.
                                </div>

                                <a
                                    href={isValid ? mailtoHref : undefined}
                                    onClick={(e) => {
                                        if (!isValid) {
                                            e.preventDefault();
                                            markAllTouched();
                                        }
                                    }}
                                >
                                    <Button disabled={!isValid}>Enviar</Button>
                                </a>
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        También puedes escribir directamente a{" "}
                        <span className="font-medium text-foreground">{CONTACT_EMAIL}</span>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
