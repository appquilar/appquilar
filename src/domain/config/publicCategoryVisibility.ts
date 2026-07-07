import type { Category } from "@/domain/models/Category";

const HIDDEN_PUBLIC_CATEGORY_SLUGS = new Set([
    "vehiculos",
    "boxes",
    "coches",
    "motos",
    "furgonetas",
    "barcos",
    "bicicletas",
    "patinetes",
]);

export const filterVisiblePublicCategories = (categories: Category[]): Category[] =>
    categories.filter((category) => !HIDDEN_PUBLIC_CATEGORY_SLUGS.has(category.slug));
