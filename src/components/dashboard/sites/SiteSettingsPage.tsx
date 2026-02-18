import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Globe } from "lucide-react";
import LoadingSpinner from "@/components/dashboard/common/LoadingSpinner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CategoryMultiSelector from "@/components/dashboard/categories/CategoryMultiSelector";
import { SITE_CONFIG } from "@/domain/config/siteConfig";
import { compositionRoot } from "@/compositionRoot";
import { Uuid } from "@/domain/valueObject/uuidv4";
import { useSiteSettings } from "./hooks/useSiteSettings";
import { toast } from "sonner";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";

const SiteSettingsPage = () => {
    const { site, setSite, categories, isLoading, error } = useSiteSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

    const allAllowedCategories = useMemo(() => categories, [categories]);

    if (isLoading) return <LoadingSpinner />;

    if (error || !site) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error ?? "No se pudo cargar el sitio."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    /* =====================
     * State setters
     * ===================== */

    const setDescription = (value: string) => {
        setSite({
            ...site,
            description: value.length ? value : null,
        });
    };

    // Selector 1 – categorías disponibles
    const setCategoryIds = (ids: string[]) => {
        setSite({
            ...site,
            categoryIds: ids,
        });
    };

    // Selector 2 – categorías del menú
    const setMenuCategoryIds = (ids: string[]) => {
        setSite({
            ...site,
            menuCategoryIds: ids.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES),
        });
    };

    // Selector 3 – categorías destacadas
    const setFeaturedCategoryIds = (ids: string[]) => {
        setSite({
            ...site,
            featuredCategoryIds: ids.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES),
        });
    };

    const pickLogoFile = (file: File) => {
        setPendingLogoFile(file);
    };

    const removeLogo = () => {
        setPendingLogoFile(null);
        setSite({ ...site, logoId: null });
    };

    /* =====================
     * Save
     * ===================== */

    const save = async () => {
        setIsSaving(true);

        try {
            let nextLogoId = site.logoId;

            // Nuevo logo → borrar anterior + subir
            if (pendingLogoFile) {
                if (site.logoId) {
                    await compositionRoot.mediaService.deleteImage(site.logoId);
                }

                nextLogoId = Uuid.generate().toString();
                await compositionRoot.mediaService.uploadImage(
                    pendingLogoFile,
                    nextLogoId
                );
            }

            // Quitar logo
            if (!pendingLogoFile && site.logoId === null) {
                const fresh = await compositionRoot.siteService.getById(site.id);
                if (fresh.logoId) {
                    await compositionRoot.mediaService.deleteImage(fresh.logoId);
                }
                nextLogoId = null;
            }

            const toUpdate = {
                ...site,
                description: site.description ?? null,
                logoId: nextLogoId,
                menuCategoryIds: site.menuCategoryIds.slice(
                    0,
                    SITE_CONFIG.MAX_MENU_CATEGORIES
                ),
                featuredCategoryIds: site.featuredCategoryIds.slice(
                    0,
                    SITE_CONFIG.MAX_FEATURED_CATEGORIES
                ),
            };

            await compositionRoot.siteService.update(toUpdate);

            setSite(toUpdate);
            setPendingLogoFile(null);

            toast.success("Configuración del sitio guardada correctamente");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar la configuración del sitio");
        } finally {
            setIsSaving(false);
        }
    };

    /* =====================
     * Render
     * ===================== */

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <DashboardSectionHeader
                title="Sitio"
                description="Edita solo los campos permitidos."
                icon={Globe}
                actions={(
                    <Button onClick={save} disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                )}
            />

            {/* Descripción */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <h2 className="font-medium">Descripción</h2>
                <Label htmlFor="site-description">Descripción del sitio</Label>
                <Textarea
                    id="site-description"
                    value={site.description ?? ""}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del sitio"
                />
            </div>

            {/* Categorías */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-6">
                <h2 className="font-medium">Categorías</h2>

                {/* Categorías disponibles */}
                <div className="space-y-1">
                    <Label>Categorías visibles en el Hero</Label>
                    <p className="text-sm text-muted-foreground">
                        Categorías visibles encima de la barra de búsqueda en la homepage.
                    </p>
                    <CategoryMultiSelector
                        categories={allAllowedCategories}
                        selectedCategoryIds={site.categoryIds}
                        onCategoriesChange={setCategoryIds}
                        placeholder="Categorías visibles en el título encima de la barra de búsqueda en el homepage"
                    />
                </div>

                {/* Categorías del menú */}
                <div className="space-y-1">
                    <Label>Categorías del menú</Label>
                    <p className="text-sm text-muted-foreground">
                        Categorías que se muestran en el menú superior del sitio
                        (máx. {SITE_CONFIG.MAX_MENU_CATEGORIES}).
                    </p>
                    <CategoryMultiSelector
                        categories={allAllowedCategories}
                        selectedCategoryIds={site.menuCategoryIds}
                        onCategoriesChange={setMenuCategoryIds}
                        placeholder="Seleccionar categorías del menú"
                    />
                </div>

                {/* Categorías destacadas */}
                <div className="space-y-1">
                    <Label>Categorías destacadas</Label>
                    <p className="text-sm text-muted-foreground">
                        Categorías que aparecen destacadas en la homepage
                        (máx. {SITE_CONFIG.MAX_FEATURED_CATEGORIES}).
                    </p>
                    <CategoryMultiSelector
                        categories={allAllowedCategories}
                        selectedCategoryIds={site.featuredCategoryIds}
                        onCategoriesChange={setFeaturedCategoryIds}
                        placeholder="Seleccionar categorías destacadas"
                    />
                </div>
            </div>
        </div>
    );
};

export default SiteSettingsPage;
