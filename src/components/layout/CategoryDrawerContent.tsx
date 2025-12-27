import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category } from "@/domain/models/Category";
import { buildCategoryBreadcrumbName } from "@/utils/categoryBreadcrumb";

type Props = {
    allCategories: Category[];
    topCategoryIds: string[]; // site.categoryIds (3-4)
    onNavigate?: () => void;  // cerrar drawer
};

type Row = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
};

function normalize(s: string) {
    return s.trim().toLowerCase();
}

function buildCategoryMap(all: Category[]) {
    const byId = new Map<string, Category>();
    for (const c of all) byId.set(c.id, c);
    return byId;
}

function buildChildrenMap(all: Category[]) {
    const children = new Map<string | null, Category[]>();
    for (const c of all) {
        const key = c.parentId ?? null;
        const arr = children.get(key) ?? [];
        arr.push(c);
        children.set(key, arr);
    }

    // orden estable por nombre
    for (const [k, arr] of children.entries()) {
        arr.sort((a, b) => a.name.localeCompare(b.name));
        children.set(k, arr);
    }

    return children;
}

export default function CategoryDrawerContent({
                                                  allCategories,
                                                  topCategoryIds,
                                                  onNavigate,
                                              }: Props) {
    const [q, setQ] = useState("");

    const byId = useMemo(() => buildCategoryMap(allCategories), [allCategories]);
    const childrenMap = useMemo(() => buildChildrenMap(allCategories), [allCategories]);

    const topCategories = useMemo(() => {
        return topCategoryIds
            .map((id) => byId.get(id))
            .filter(Boolean) as Category[];
    }, [topCategoryIds, byId]);

    const filteredRows = useMemo<Row[]>(() => {
        const term = normalize(q);
        if (!term) return [];

        return allCategories
            .filter((c) => normalize(c.name).includes(term) || normalize(c.slug).includes(term))
            .slice(0, 50)
            .map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                parentId: c.parentId ?? null,
            }));
    }, [allCategories, q]);

    const showSearchResults = q.trim().length > 0;

    return (
        <div className="flex h-full flex-col">
            <div className="pb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Principales</p>
                <div className="flex flex-col gap-1">
                    {topCategories.map((c) => (
                        <Link
                            key={c.id}
                            to={`/category/${c.slug}`}
                            onClick={onNavigate}
                            className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary"
                        >
                            <span className="text-sm font-medium">{c.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="py-3 border-t">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar categoría..."
                    className="h-10"
                />
                <p className="text-xs text-muted-foreground mt-2">
                    {showSearchResults ? "Resultados" : "Todas las categorías"}
                </p>
            </div>

            <ScrollArea className="flex-1 pr-2">
                {showSearchResults ? (
                    <div className="py-2">
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
                    <div className="py-2">
                        {(childrenMap.get(null) ?? []).map((root) => (
                            <CategoryNode
                                key={root.id}
                                node={root}
                                childrenMap={childrenMap}
                                onNavigate={onNavigate}
                                level={0}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

function CategoryNode({
                          node,
                          childrenMap,
                          level,
                          onNavigate,
                      }: {
    node: Category;
    childrenMap: Map<string | null, Category[]>;
    level: number;
    onNavigate?: () => void;
}) {
    const children = childrenMap.get(node.id) ?? [];
    const hasChildren = children.length > 0;

    return (
        <div className="py-1">
            <Link
                to={`/category/${node.slug}`}
                onClick={onNavigate}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-secondary"
                style={{ paddingLeft: 8 + level * 14 }}
            >
                <span className="text-sm font-medium">{node.name}</span>
                {hasChildren ? <span className="text-xs text-muted-foreground">›</span> : null}
            </Link>

            {hasChildren ? (
                <div className="mt-1">
                    {children.map((c) => (
                        <CategoryNode
                            key={c.id}
                            node={c}
                            childrenMap={childrenMap}
                            onNavigate={onNavigate}
                            level={level + 1}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
