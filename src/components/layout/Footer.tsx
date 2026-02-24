import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

type SocialLink = {
    key: string;
    label: string;
    href: string;
    Icon: ComponentType<{ size?: number }>;
};

type FooterLink =
    | { key: string; label: string; to: string }
    | { key: string; label: string; href: string; external: true };

const BRAND = {
    name: "Appquilar",
    logoSrc: "/appquilar-combined-orange.png",
    description:
        "Alquila lo que necesitas, cuando lo necesitas. Ahorra dinero, reduce residuos y accede a productos de calidad sin comprarlos.",
};

const ENABLE_NEWSLETTER = false;

const SOCIAL_LINKS: SocialLink[] = [
    { key: "instagram", label: "Instagram", href: "https://www.instagram.com/appquilar", Icon: Instagram },
    // { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/XXXX", Icon: Linkedin },
    // { key: "twitter", label: "X", href: "https://twitter.com/XXXX", Icon: Twitter },
    // { key: "facebook", label: "Facebook", href: "https://facebook.com/XXXX", Icon: Facebook },
];

const COMPANY_LINKS: FooterLink[] = [
    { key: "about", label: "Quiénes somos", to: "/about" },
    { key: "partners", label: "Colabora con nosotros", to: "/partners" },
    { key: "blog", label: "Blog", to: "/blog" },
    { key: "contact", label: "Contacto", to: "/contact" },
];

const LEGAL_LINKS: FooterLink[] = [
    { key: "terms", label: "Términos de uso", to: "/legal/terminos" },
    { key: "privacy", label: "Política de privacidad", to: "/legal/privacidad" },
    { key: "cookies", label: "Política de cookies", to: "/legal/cookies" },
    { key: "legal", label: "Aviso legal", to: "/legal/aviso-legal" },
];

const FooterNavLink = ({ link, className }: { link: FooterLink; className?: string }) => {
    if ("external" in link && link.external) {
        return (
            <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {link.label}
            </a>
        );
    }

    return (
        <Link to={link.to} className={className}>
            {link.label}
        </Link>
    );
};

const Footer = () => {
    return (
        <footer className="mt-16 border-t border-border/70 bg-white px-4 py-12 sm:px-6 md:px-8">
            <div className="mx-auto w-full max-w-[1320px]">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    {/* Logo + descripción */}
                    <div className="space-y-5 md:col-span-2">
                        <Link to="/" aria-label="Ir a inicio">
                            <img
                                src={BRAND.logoSrc}
                                alt={BRAND.name}
                                className="h-7 w-auto"
                                loading="lazy"
                            />
                        </Link>

                        <p className="max-w-md text-sm text-muted-foreground">
                            {BRAND.description}
                        </p>

                        {ENABLE_NEWSLETTER ? (
                            <div className="pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Suscríbete para recibir novedades y ofertas puntuales.
                                </p>

                                <form
                                    className="mt-3 flex flex-wrap"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <input
                                        type="email"
                                        placeholder="Tu email"
                                        className="mb-2 min-w-[180px] flex-1 rounded-r-md rounded-l-md border border-border bg-background px-3 py-2 text-sm text-foreground sm:mb-0 sm:rounded-r-none"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full rounded-r-md rounded-l-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:rounded-l-none sm:rounded-r-md"
                                    >
                                        Suscribirme
                                    </button>
                                </form>
                            </div>
                        ) : null}
                    </div>

                    {/* Empresa */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Empresa
                        </h3>
                        <ul className="space-y-2">
                            {COMPANY_LINKS.map((l) => (
                                <li key={l.key}>
                                    <FooterNavLink
                                        link={l}
                                        className="text-sm text-foreground/75 transition-colors hover:text-foreground"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* RRSS */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Conecta
                        </h3>

                        <div className="flex gap-3">
                            {SOCIAL_LINKS.map(({ key, href, label, Icon }) => (
                                <a
                                    key={key}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-border/80 p-2 text-muted-foreground transition-colors hover:text-primary"
                                    aria-label={label}
                                    title={label}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 md:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {LEGAL_LINKS.map((l) => (
                            <FooterNavLink
                                key={l.key}
                                link={l}
                                className="text-xs text-foreground/65 transition-colors hover:text-foreground"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
