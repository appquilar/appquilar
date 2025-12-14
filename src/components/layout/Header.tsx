import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentUser } from "@/application/hooks/useCurrentUser";

import AppLogo from "@/components/common/AppLogo";
import { usePublicSiteCategories } from "@/application/hooks/usePublicSiteCategories";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CategoryDrawerTree } from "@/components/layout/CategoryDrawerTree";

const normalize = (s: string) =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    // buscador local
    const [categoryQuery, setCategoryQuery] = useState("");

    const { user: currentUser, isAuthenticated } = useCurrentUser();
    const { logout } = useAuth();

    const { rotatingCategories, allCategories, isLoading: isSiteLoading } = usePublicSiteCategories();

    const displayName =
        currentUser?.firstName
            ? `${currentUser.firstName} ${currentUser.lastName ?? ""}`.trim()
            : currentUser?.email ?? "Usuario";

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isAuthenticated) return;
        const msg = sessionStorage.getItem("auth:postChangePasswordMessage");
        if (msg) setAuthModalOpen(true);
    }, [isAuthenticated]);

    const handleLogout = async () => {
        await logout();
    };

    // Chips top (3-4) -> site.categoryIds (rotatingCategories)
    const featuredTop = useMemo(() => {
        if (!isSiteLoading && rotatingCategories.length > 0) return rotatingCategories.slice(0, 4);
        return [];
    }, [isSiteLoading, rotatingCategories]);

    // Drawer categories reales (sin fallback fake)
    const drawerCategories = useMemo(() => {
        if (isSiteLoading) return [];
        return allCategories;
    }, [allCategories, isSiteLoading]);

    // index por id para breadcrumb local
    const categoryById = useMemo(() => {
        const map = new Map<string, (typeof allCategories)[number]>();
        for (const c of allCategories) map.set(c.id, c);
        return map;
    }, [allCategories]);

    const buildBreadcrumb = (categoryId: string) => {
        const parts: string[] = [];
        const seen = new Set<string>();
        let cur = categoryById.get(categoryId) ?? null;

        while (cur && !seen.has(cur.id)) {
            seen.add(cur.id);
            parts.push(cur.name);
            cur = cur.parentId ? categoryById.get(cur.parentId) ?? null : null;
        }

        return parts.reverse().join(" / ");
    };

    const queryNorm = useMemo(() => normalize(categoryQuery), [categoryQuery]);
    const hasQuery = queryNorm.length > 0;

    const searchResults = useMemo(() => {
        if (!hasQuery) return [];
        const q = queryNorm;

        return drawerCategories
            .filter((c) => normalize(c.name).includes(q))
            .slice(0, 60);
    }, [drawerCategories, hasQuery, queryNorm]);

    // al cerrar el sheet, limpia query
    useEffect(() => {
        if (!categoriesOpen) setCategoryQuery("");
    }, [categoriesOpen]);

    const DrawerTop = (
        <div className="sticky top-0 z-10 bg-background border-b p-6">
            <SheetHeader className="space-y-1">
                <SheetTitle>Categorías</SheetTitle>
                <p className="text-sm text-muted-foreground">Explora el catálogo por familia</p>
            </SheetHeader>

            {/* Buscador local */}
            <div className="mt-4">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        value={categoryQuery}
                        onChange={(e) => setCategoryQuery(e.target.value)}
                        placeholder="Buscar categoría…"
                        className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {hasQuery ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {searchResults.length} resultado(s)
                    </p>
                ) : null}
            </div>
        </div>
    );

    const DrawerBody = (() => {
        if (drawerCategories.length === 0) {
            return <div className="text-sm text-muted-foreground">Cargando categorías…</div>;
        }

        // ✅ NO desmontamos el árbol al buscar (evita resets y re-efectos)
        return (
            <div className="relative">
                <div className={hasQuery ? "hidden" : "block"}>
                    <CategoryDrawerTree
                        categories={drawerCategories}
                        isOpen={categoriesOpen}
                        onNavigate={() => setCategoriesOpen(false)}
                    />
                </div>

                <div className={hasQuery ? "block" : "hidden"}>
                    {searchResults.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No hay resultados para “{categoryQuery}”.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {searchResults.map((c) => (
                                <Link
                                    key={c.id}
                                    to={`/category/${c.slug}`}
                                    onClick={() => setCategoriesOpen(false)}
                                    className="block py-3 px-2 rounded-md hover:bg-secondary"
                                >
                                    <div className="text-sm font-medium">{c.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {buildBreadcrumb(c.id)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    })();

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 px-4 md:px-8 ${
                    isScrolled ? "py-3 bg-white shadow-sm" : "py-5 bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center hover:opacity-90" aria-label="Ir a inicio">
                        <AppLogo
                            imageClassName="h-8 w-auto"
                            textClassName="text-2xl font-display font-semibold tracking-tight text-primary"
                        />
                    </Link>

                    {/* ✅ ÚNICO Sheet para desktop + mobile (fix foco) */}
                    <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                        {/* Desktop */}
                        <div className="hidden md:flex items-center gap-4">
                            <nav className="flex items-center gap-2">
                                {featuredTop.map((c) => (
                                    <Link
                                        key={c.id}
                                        to={`/category/${c.slug}`}
                                        className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </nav>

                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Menu size={18} />
                                    Categorías
                                </Button>
                            </SheetTrigger>
                        </div>

                        <SheetContent side="left" className="p-0 w-[360px] sm:w-[420px] flex flex-col">
                            {DrawerTop}
                            <div className="flex-1 overflow-y-auto p-6">{DrawerBody}</div>
                        </SheetContent>

                        {/* Acciones derecha */}
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/search"
                                className="p-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Buscar"
                            >
                                <Search size={20} />
                            </Link>

                            {isAuthenticated && currentUser ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2 font-medium hover:bg-accent transition-colors"
                                        >
                                            <User size={16} />
                                            <span className="hidden sm:inline">Hola {displayName}</span>
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="p-0 w-56" align="end">
                                        <div className="p-3 border-b">
                                            <p className="font-medium">¡Hola, {displayName}!</p>
                                        </div>

                                        <div className="p-1">
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md w-full text-sm"
                                            >
                                                <LayoutDashboard size={16} />
                                                <span>Panel de Control</span>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md w-full text-left text-destructive text-sm"
                                            >
                                                <LogOut size={16} />
                                                <span>Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-accent transition-colors font-medium"
                                    onClick={() => setAuthModalOpen(true)}
                                >
                                    Iniciar Sesión
                                </Button>
                            )}

                            {/* Mobile trigger (mismo Sheet) */}
                            <div className="md:hidden">
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Categorías">
                                        <Menu size={24} />
                                    </Button>
                                </SheetTrigger>
                            </div>
                        </div>
                    </Sheet>
                </div>
            </header>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
    );
};

export default Header;
