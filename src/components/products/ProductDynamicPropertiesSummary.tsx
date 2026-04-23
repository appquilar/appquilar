import type { ResolvedDynamicPropertyDisplayItem } from "@/domain/services/DynamicPropertyService";

interface ProductDynamicPropertiesSummaryProps {
    items: ResolvedDynamicPropertyDisplayItem[];
    isLoading?: boolean;
}

const ProductDynamicPropertiesSummary = ({
    items,
    isLoading = false,
}: ProductDynamicPropertiesSummaryProps) => {
    if (!isLoading && items.length === 0) {
        return null;
    }

    return (
        <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Características</h2>

            {isLoading && items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cargando propiedades de la categoría...</p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                        <div
                            key={item.code}
                            className="rounded-xl border border-border/70 bg-card/70 px-4 py-3"
                        >
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductDynamicPropertiesSummary;
