import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import type { Category } from "@/domain/models/Category";
import { compositionRoot } from "@/compositionRoot";

interface Props {
    categories: Category[];
    isOpen: boolean;
    onNavigate?: () => void;
}

type Node = {
    category: Category;
    children: Node[];
};

const sortByName = (a: Category, b: Category) => a.name.localeCompare(b.name, "es");

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

    // raíces = parentId null o parent no encontrado (robusto a datos “rotos”)
    const roots = categories
        .filter((c) => {
            const pid = c.parentId ?? null;
            return pid === null || !byId.has(pid);
        })
        .sort(sortByName);

    const tree = roots.map(makeNode);

    // si hay “huérfanas” o ciclos raros, las colgamos como roots adicionales
    const missing = categories.filter((c) => !visited.has(c.id)).sort(sortByName);
    for (const c of missing) tree.push(makeNode(c));

    return tree;
};

const ROW_BASE =
    "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors";

export const CategoryDrawerTree = ({ categories, isOpen, onNavigate }: Props) => {
    // expand state (persistente mientras dure el componente)
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());

    // icon URLs (solo se descargan si drawer abierto)
    const [iconUrlsById, setIconUrlsById] = useState<Record<string, string>>({});

    const tree = useMemo(() => buildTree(categories), [categories]);

    const toggle = (id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Descarga de iconos bajo demanda (solo abierto)
    useEffect(() => {
        let alive = true;

        const load = async () => {
            if (!isOpen) return;
            if (categories.length === 0) return;

            const candidates = categories
                .filter((c) => !!c.iconId)
                .map((c) => ({ id: c.id, iconId: c.iconId! }));

            const missing = candidates.filter(({ id }) => !iconUrlsById[id]);
            if (missing.length === 0) return;

            try {
                const entries = await Promise.all(
                    missing.map(async ({ id, iconId }) => {
                        const blob = await compositionRoot.mediaService.getImage(iconId, "ORIGINAL");
                        const url = URL.createObjectURL(blob);
                        return [id, url] as const;
                    })
                );

                if (!alive) return;

                setIconUrlsById((prev) => {
                    const next = { ...prev };
                    for (const [id, url] of entries) {
                        const prevUrl = next[id];
                        if (prevUrl && prevUrl !== url) URL.revokeObjectURL(prevUrl);
                        next[id] = url;
                    }
                    return next;
                });
            } catch {
                // si falla, sin icono
            }
        };

        void load();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, categories]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(iconUrlsById).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [iconUrlsById]);

    const RowIcon = ({ id }: { id: string }) => {
        const url = iconUrlsById[id];
        if (!url) return <span className="h-5 w-5 shrink-0 rounded bg-muted" />;
        return <img src={url} alt="" className="h-7 w-7 object-contain shrink-0" loading="lazy" />;
    };

    const renderNode = (node: Node, depth: number) => {
        const { category, children } = node;
        const hasChildren = children.length > 0;
        const isExpanded = openIds.has(category.id);

        // indent visual (sin complicar CSS)
        const indent = depth === 0 ? "" : `pl-${Math.min(10, 3 + depth * 2)}`;

        return (
            <div key={category.id} className="select-none">
                <div className={`${ROW_BASE} ${indent}`}>
                    <RowIcon id={category.id} />

                    <Link
                        to={`/category/${category.slug}`}
                        onClick={onNavigate}
                        className="flex-1 min-w-0"
                    >
            <span className="text-sm font-medium text-foreground truncate">
              {category.name}
            </span>
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
                    <div className="mt-1 space-y-1">
                        {children.map((child) => renderNode(child, depth + 1))}
                    </div>
                ) : null}
            </div>
        );
    };

    return <div className="space-y-1">{tree.map((n) => renderNode(n, 0))}</div>;
};
