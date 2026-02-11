import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Facebook } from "lucide-react";

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
    logoSrc: "/appquilar-combined-white.png",
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
        <footer className="bg-neutral-500 text-neutral-200 py-14 px-6 md:px-8 mt-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Logo + descripción */}
                    <div className="space-y-5 md:col-span-2">
                        <Link to="/" aria-label="Ir a inicio">
                            <img
                                src={BRAND.logoSrc}
                                alt={BRAND.name}
                                className="h-8 w-auto"
                                loading="lazy"
                            />
                        </Link>

                        <p className="text-sm text-neutral-400 max-w-md">
                            {BRAND.description}
                        </p>

                        {ENABLE_NEWSLETTER ? (
                            <div className="pt-4">
                                <p className="text-sm text-neutral-400">
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
                                        className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-l-md sm:rounded-r-none rounded-r-md mb-2 sm:mb-0 bg-neutral-800 border border-neutral-700 text-neutral-100"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-primary text-primary-foreground px-4 py-2 text-sm sm:rounded-l-none rounded-l-md sm:rounded-r-md rounded-r-md hover:bg-primary/90 transition-colors w-full sm:w-auto"
                                    >
                                        Suscribirme
                                    </button>
                                </form>
                            </div>
                        ) : null}
                    </div>

                    {/* Empresa */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            Empresa
                        </h3>
                        <ul className="space-y-2">
                            {COMPANY_LINKS.map((l) => (
                                <li key={l.key}>
                                    <FooterNavLink
                                        link={l}
                                        className="text-sm text-neutral-300 hover:text-white transition-colors"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* RRSS */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            Conecta
                        </h3>

                        <div className="flex gap-3">
                            {SOCIAL_LINKS.map(({ key, href, label, Icon }) => (
                                <a
                                    key={key}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
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
                <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-neutral-500">
                        © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {LEGAL_LINKS.map((l) => (
                            <FooterNavLink
                                key={l.key}
                                link={l}
                                className="text-xs text-neutral-400 hover:text-white transition-colors"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
