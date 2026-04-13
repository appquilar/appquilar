import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import type { Category } from "@/domain/models/Category";
import { Input } from "@/components/ui/input";
import { buildCategoryBreadcrumbName } from "@/utils/categoryBreadcrumb";
import { buildCategoryPath } from "@/domain/config/publicRoutes";
import CategoryIcon from "@/components/categories/CategoryIcon";

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

    const renderNode = (node: Node, depth: number) => {
        const { category, children } = node;
        const hasChildren = children.length > 0;
        const isExpanded = openIds.has(category.id);

        const paddingLeft = depth === 0 ? 0 : Math.min(28, 8 + depth * 14);

        return (
            <div key={category.id} className="select-none">
                <div className={ROW_BASE} style={{ paddingLeft }}>
                    <CategoryIcon
                        iconName={category.iconName}
                        containerClassName="h-10 w-10 shrink-0 rounded-md bg-muted/80 text-foreground"
                        iconClassName="h-5 w-5"
                    />

                    <Link to={buildCategoryPath(category.slug)} onClick={onNavigate} className="flex-1 min-w-0">
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
                                        to={buildCategoryPath(r.slug)}
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
