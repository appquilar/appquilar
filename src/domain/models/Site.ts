export interface Site {
    id: string; // backend: site_id
    name: string;
    title: string;
    url: string;
    description: string | null;

    logoId: string | null; // backend: logo_id
    faviconId: string | null; // backend: favicon_id

    primaryColor: string;

    categoryIds: string[];
    menuCategoryIds: string[];
    featuredCategoryIds: string[];
}

export type SiteUpdatePayload = {
    // Solo lo editable en la UI
    description: string | null;
    logoId: string | null;

    categoryIds: string[];
    menuCategoryIds: string[];
    featuredCategoryIds: string[];
};
