import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import type { Category } from "@/domain/models/Category";
import { compositionRoot } from "@/compositionRoot";
import { Input } from "@/components/ui/input";
import { buildCategoryBreadcrumbName } from "@/utils/categoryBreadcrumb";

interface Props {
    categories: Category[];
    isOpen: boolean;
    onNavigate?: () => void;
}

type Node = {
    category: Category;
    children: Node[];
};

type SearchRow = {
    id: string;
    name: string;
    slug: string;
};

const sortByName = (a: Category, b: Category) => a.name.localeCompare(b.name, "es");

const normalize = (s: string) => s.trim().toLowerCase();

const buildCategoryMap = (categories: Category[]) => {
    const byId = new Map<string, Category>();
    categories.forEach((c) => byId.set(c.id, c));
    return byId;
};

const buildTree = (categories: Category[]): Node[] => {
    const byId = new Map<string, Category>();
    categories.forEach((c) => byId.set(c.id, c));

    const childrenByParent = new Map<string | null, Category[]>();
    for (const c of categories) {
        const parentId = c.parentId ?? null;
        const list = childrenByParent.get(parentId) ?? [];
        list.push(c);
        childrenByParent.set(parentId, list);
    }

    const visited = new Set<string>();

    const makeNode = (c: Category): Node => {
        visited.add(c.id);
        const kids = (childrenByParent.get(c.id) ?? []).sort(sortByName);
        return {
            category: c,
            children: kids.map(makeNode),
        };
    };

    const roots = categories
        .filter((c) => {
            const pid = c.parentId ?? null;
            return pid === null || !byId.has(pid);
        })
        .sort(sortByName);

    const tree = roots.map(makeNode);

    const missing = categories.filter((c) => !visited.has(c.id)).sort(sortByName);
    for (const c of missing) tree.push(makeNode(c));

    return tree;
};

const ROW_BASE =
    "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors";

export const CategoryDrawerTree = ({ categories, isOpen, onNavigate }: Props) => {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const [q, setQ] = useState("");

    /**
     * Cache en memoria (por iconId, no por categoryId).
     */
    const iconUrlByIconIdRef = useRef<Map<string, string>>(new Map());
    const [iconUrlByIconId, setIconUrlByIconId] = useState<Record<string, string>>({});

    const byId = useMemo(() => buildCategoryMap(categories), [categories]);
    const tree = useMemo(() => buildTree(categories), [categories]);

    const showSearchResults = q.trim().length > 0;

    const filteredRows = useMemo<SearchRow[]>(() => {
        const term = normalize(q);
        if (!term) return [];

        return categories
            .filter((c) => normalize(c.name).includes(term) || normalize(c.slug).includes(term))
            .slice(0, 50)
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
    }, [categories, q]);

    const toggle = (id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Lista de iconIds que existen (estable)
    const iconIdsKey = useMemo(() => {
        const ids = categories.map((c) => c.iconId).filter(Boolean) as string[];
        ids.sort();
        return ids.join("|");
    }, [categories]);

    // Descarga de iconos SOLO cuando el drawer está abierto, y SOLO los que faltan en cache
    useEffect(() => {
        let alive = true;

        const load = async () => {
            if (!isOpen) return;
            if (!iconIdsKey) return;

            const iconIds = iconIdsKey.split("|").filter(Boolean);
            const missing = iconIds.filter((iconId) => !iconUrlByIconIdRef.current.has(iconId));
            if (missing.length === 0) return;

            try {
                const entries = await Promise.all(
                    missing.map(async (iconId) => {
                        const blob = await compositionRoot.mediaService.getImage(iconId, "ORIGINAL");
                        const url = URL.createObjectURL(blob);
                        return [iconId, url] as const;
                    })
                );

                if (!alive) return;

                for (const [iconId, url] of entries) {
                    iconUrlByIconIdRef.current.set(iconId, url);
                }

                setIconUrlByIconId(() => {
                    const next: Record<string, string> = {};
                    for (const [iconId, url] of iconUrlByIconIdRef.current.entries()) {
                        next[iconId] = url;
                    }
                    return next;
                });
            } catch {
                // ignore
            }
        };

        void load();

        return () => {
            alive = false;
        };
    }, [isOpen, iconIdsKey]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            for (const url of iconUrlByIconIdRef.current.values()) {
                URL.revokeObjectURL(url);
            }
            iconUrlByIconIdRef.current.clear();
        };
    }, []);

    const RowIcon = ({ category }: { category: Category }) => {
        if (!category.iconId) return <span className="h-9 w-9 shrink-0 rounded bg-muted" />;

        const url = iconUrlByIconId[category.iconId];
        if (!url) return <span className="h-9 w-9 shrink-0 rounded bg-muted animate-pulse" />;

        return <img src={url} alt="" className="h-10 w-10 object-contain shrink-0" loading="lazy" />;
    };

    const renderNode = (node: Node, depth: number) => {
        const { category, children } = node;
        const hasChildren = children.length > 0;
        const isExpanded = openIds.has(category.id);

        const paddingLeft = depth === 0 ? 0 : Math.min(28, 8 + depth * 14);

        return (
            <div key={category.id} className="select-none">
                <div className={ROW_BASE} style={{ paddingLeft }}>
                    <RowIcon category={category} />

                    <Link to={`/category/${category.slug}`} onClick={onNavigate} className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{category.name}</span>
                    </Link>

                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => toggle(category.id)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            aria-label={isExpanded ? "Contraer" : "Expandir"}
                        >
                            <ChevronDown
                                size={18}
                                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                        </button>
                    ) : null}
                </div>

                {hasChildren && isExpanded ? (
                    <div className="mt-1 space-y-1">{children.map((child) => renderNode(child, depth + 1))}</div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {/* Buscador */}
            <div className="space-y-2">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar categoría..."
                    className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                    {showSearchResults ? "Resultados" : "Todas las categorías"}
                </p>
            </div>

            {/* Resultados o árbol */}
            {showSearchResults ? (
                <div className="space-y-1">
                    {filteredRows.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-6">
                            No hay resultados para “{q}”.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredRows.map((r) => {
                                const c = byId.get(r.id);
                                const breadcrumb = c ? buildCategoryBreadcrumbName(c, byId) : r.name;

                                return (
                                    <Link
                                        key={r.id}
                                        to={`/category/${r.slug}`}
                                        onClick={onNavigate}
                                        className="flex flex-col gap-1 py-3 hover:bg-secondary rounded-md px-2"
                                    >
                                        <span className="text-sm font-medium">{r.name}</span>
                                        <span className="text-xs text-muted-foreground">{breadcrumb}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-1">{tree.map((n) => renderNode(n, 0))}</div>
            )}
        </div>
    );
};
