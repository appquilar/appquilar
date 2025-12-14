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

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { CategoryDrawerTree } from "@/components/layout/CategoryDrawerTree";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const [categoriesOpen, setCategoriesOpen] = useState(false);

    const { user: currentUser, isAuthenticated } = useCurrentUser();
    const { logout } = useAuth();

    const {
        rotatingCategories,
        allCategories,
        isLoading: isSiteLoading,
    } = usePublicSiteCategories();

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

    const featuredTop = useMemo(() => {
        if (!isSiteLoading && rotatingCategories.length > 0) {
            return rotatingCategories.slice(0, 4);
        }
        return [];
    }, [isSiteLoading, rotatingCategories]);

    // Para el drawer jerárquico: si aún no cargó, vació (no fallback “fake”)
    // porque el árbol con datos falsos puede confundir.
    const drawerCategories = useMemo(() => {
        if (isSiteLoading) return [];
        return allCategories;
    }, [allCategories, isSiteLoading]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 px-4 md:px-8 ${
                    isScrolled ? "py-3 bg-white shadow-sm" : "py-5 bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo (AppLogo) */}
                    <Link
                        to="/"
                        className="flex items-center transition-opacity hover:opacity-90"
                        aria-label="Ir a inicio"
                    >
                        <AppLogo
                            imageClassName="h-8 w-auto"
                            textClassName="text-2xl font-display font-semibold tracking-tight text-primary"
                        />
                    </Link>

                    {/* Desktop: chips + botón categorías */}
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

                        <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Menu size={18} />
                                    Categorías
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="p-0 w-[360px] sm:w-[420px] flex flex-col"
                            >
                                {/* TOP sticky */}
                                <div className="sticky top-0 z-10 bg-background border-b p-6">
                                    <SheetHeader className="space-y-1">
                                        <SheetTitle>Categorías</SheetTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Explora el catálogo por familia
                                        </p>
                                    </SheetHeader>

                                    {featuredTop.length > 0 ? (
                                        <div className="mt-5">
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                                                Destacadas
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {featuredTop.map((c) => (
                                                    <Link
                                                        key={c.id}
                                                        to={`/category/${c.slug}`}
                                                        onClick={() => setCategoriesOpen(false)}
                                                        className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                                                    >
                                                        {c.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Scroll jerárquico */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {drawerCategories.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            Cargando categorías…
                                        </div>
                                    ) : (
                                        <CategoryDrawerTree
                                            categories={drawerCategories}
                                            isOpen={categoriesOpen}
                                            onNavigate={() => setCategoriesOpen(false)}
                                        />
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

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

                        {/* Mobile: mismo drawer */}
                        <div className="md:hidden">
                            <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Categorías">
                                        <Menu size={24} />
                                    </Button>
                                </SheetTrigger>

                                <SheetContent
                                    side="left"
                                    className="p-0 w-[320px] sm:w-[380px] flex flex-col"
                                >
                                    <div className="sticky top-0 z-10 bg-background border-b p-6">
                                        <SheetHeader className="space-y-1">
                                            <SheetTitle>Categorías</SheetTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Explora el catálogo por familia
                                            </p>
                                        </SheetHeader>

                                        {featuredTop.length > 0 ? (
                                            <div className="mt-5">
                                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                                                    Destacadas
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {featuredTop.map((c) => (
                                                        <Link
                                                            key={c.id}
                                                            to={`/category/${c.slug}`}
                                                            onClick={() => setCategoriesOpen(false)}
                                                            className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                                                        >
                                                            {c.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">
                                        {drawerCategories.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">
                                                Cargando categorías…
                                            </div>
                                        ) : (
                                            <CategoryDrawerTree
                                                categories={drawerCategories}
                                                isOpen={categoriesOpen}
                                                onNavigate={() => setCategoriesOpen(false)}
                                            />
                                        )}

                                        <div className="mt-6 pt-6 border-t">
                                            {isAuthenticated && currentUser ? (
                                                <Link to="/dashboard" onClick={() => setCategoriesOpen(false)}>
                                                    <Button className="w-full">Mi Panel</Button>
                                                </Link>
                                            ) : (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => {
                                                        setCategoriesOpen(false);
                                                        setAuthModalOpen(true);
                                                    }}
                                                >
                                                    Iniciar Sesión
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
    );
};

export default Header;
