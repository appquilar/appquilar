import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Globe } from "lucide-react";
import { toast } from "sonner";

import LoadingSpinner from "@/components/dashboard/common/LoadingSpinner";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";
import CategoryMultiSelector from "@/components/dashboard/categories/CategoryMultiSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_CONFIG } from "@/domain/config/siteConfig";

import { useSiteSettings } from "./hooks/useSiteSettings";

const SiteSettingsPage = () => {
    const {
        site,
        categories,
        isLoading,
        isSaving,
        error,
        setDescription,
        setCategoryIds,
        setMenuCategoryIds,
        setFeaturedCategoryIds,
        save,
    } = useSiteSettings();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !site) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error ?? "No se pudo cargar el sitio."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            await save();
            toast.success("Configuración del sitio guardada correctamente");
        } catch (saveError) {
            console.error(saveError);
            toast.error("Error al guardar la configuración del sitio");
        }
    };

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                title="Sitio"
                description="Edita solo los campos permitidos."
                icon={Globe}
                actions={(
                    <Button onClick={() => void handleSave()} disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                )}
            />

            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <h2 className="font-medium">Descripción</h2>
                <Label htmlFor="site-description">Descripción del sitio</Label>
                <Textarea
                    id="site-description"
                    value={site.description ?? ""}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Descripción del sitio"
                />
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-6">
                <h2 className="font-medium">Categorías</h2>

                <div className="space-y-1">
                    <Label>Categorías visibles en el Hero</Label>
                    <p className="text-sm text-muted-foreground">
                        Categorías visibles encima de la barra de búsqueda en la homepage.
                    </p>
                    <CategoryMultiSelector
                        categories={categories}
                        selectedCategoryIds={site.categoryIds}
                        onCategoriesChange={setCategoryIds}
                        placeholder="Categorías visibles en el título encima de la barra de búsqueda en el homepage"
                    />
                </div>

                <div className="space-y-1">
                    <Label>Categorías del menú</Label>
                    <p className="text-sm text-muted-foreground">
                        Categorías que se muestran en el menú superior del sitio
                        (máx. {SITE_CONFIG.MAX_MENU_CATEGORIES}).
                    </p>
                    <CategoryMultiSelector
                        categories={categories}
                        selectedCategoryIds={site.menuCategoryIds}
                        onCategoriesChange={setMenuCategoryIds}
                        placeholder="Seleccionar categorías del menú"
                    />
                </div>

                <div className="space-y-1">
                    <Label>Categorías destacadas</Label>
                    <p className="text-sm text-muted-foreground">
                        Categorías que aparecen destacadas en la homepage
                        (máx. {SITE_CONFIG.MAX_FEATURED_CATEGORIES}).
                    </p>
                    <CategoryMultiSelector
                        categories={categories}
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
