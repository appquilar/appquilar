import type { Category } from "@/domain/models/Category";

type Options = {
    separator?: string;
    maxDepth?: number;
};

/**
 * Construye "Root > Child > Current" usando parentId y un Map por id.
 * - NO llama a ningún endpoint (100% en memoria)
 * - Tiene guard para evitar bucles infinitos
 */
export function buildCategoryBreadcrumbName(
    category: Category,
    byId: Map<string, Category>,
    opts?: Options
): string {
    const separator = opts?.separator ?? " > ";
    const maxDepth = opts?.maxDepth ?? 20;

    const names: string[] = [];
    let curr: Category | undefined = category;
    let guard = 0;

    while (curr && guard < maxDepth) {
        names.unshift(curr.name);
        curr = curr.parentId ? byId.get(curr.parentId) : undefined;
        guard += 1;
    }

    return names.join(separator);
}
