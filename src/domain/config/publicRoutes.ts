export const PUBLIC_PATHS = {
    home: "/",
    company: "/empresa",
    categories: "/categorias",
    search: "/buscar",
    about: "/quienes-somos",
    contact: "/contacto",
    partners: "/colabora-con-nosotros",
    blog: "/blog",
    legalNotice: "/legal/aviso-legal",
    terms: "/legal/terminos",
    cookies: "/legal/cookies",
    privacy: "/legal/privacidad",
    resetPassword: "/reset-password",
    companyInvitation: "/company-invitation",
    dashboard: "/dashboard",
} as const;

export const LEGACY_PUBLIC_PATHS = {
    company: "/company/:slug",
    categories: "/categories",
    category: "/category/:slug",
    product: "/product/:slug",
    search: "/search",
    about: "/about",
    contact: "/contact",
    partners: "/partners",
} as const;

const DEFAULT_PUBLIC_SITE_ORIGIN = "https://appquilar.com";

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const resolvePublicSiteOrigin = (): string => {
    if (typeof window !== "undefined" && window.location?.origin) {
        return trimTrailingSlashes(window.location.origin);
    }

    return DEFAULT_PUBLIC_SITE_ORIGIN;
};

export const buildCategoryPath = (slug: string): string => `/categoria/${encodeURIComponent(slug)}`;

export const buildProductPath = (slug: string): string => `/producto/${encodeURIComponent(slug)}`;

export const buildCompanyPath = (slug: string): string =>
    `${PUBLIC_PATHS.company}/${encodeURIComponent(slug)}`;

export const buildCompanyPagePath = (slug: string, page?: number): string => {
    const base = buildCompanyPath(slug);
    if (!page || page <= 1) {
        return base;
    }

    return `${base}?page=${page}`;
};

export const buildBlogPostPath = (slugPath: string): string => {
    const normalized = slugPath.replace(/^\/+/, "");
    return `${PUBLIC_PATHS.blog}/${normalized}`;
};

export const buildSearchPath = (query?: string): string => {
    const base = PUBLIC_PATHS.search;
    if (!query || query.trim().length === 0) {
        return base;
    }

    return `${base}?q=${encodeURIComponent(query.trim())}`;
};

export const buildBlogPagePath = (page?: number): string => {
    if (!page || page <= 1) {
        return PUBLIC_PATHS.blog;
    }

    return `${PUBLIC_PATHS.blog}?page=${page}`;
};

export const buildAbsolutePublicUrl = (path: string): string => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${resolvePublicSiteOrigin()}${normalizedPath}`;
};
