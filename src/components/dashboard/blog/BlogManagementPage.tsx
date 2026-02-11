import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, FilePlus2, Plus, Trash2 } from 'lucide-react';
import {
    useAdminBlogCategories,
    useAdminBlogPosts,
    useCreateBlogCategory,
    useDeleteBlogCategory,
    useDraftBlogPost,
    usePublishBlogPost,
} from '@/application/hooks/useBlog';
import type { BlogPostStatus } from '@/domain/models/BlogPost';
import { Uuid } from '@/domain/valueObject/uuidv4';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const statusLabels: Record<BlogPostStatus, string> = {
    draft: 'Borrador',
    scheduled: 'Programado',
    published: 'Publicado',
};

const statusBadgeClass: Record<BlogPostStatus, string> = {
    draft: 'bg-amber-100 text-amber-700 border-amber-200',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const formatDate = (value: string | null) => {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(parsed);
};

const BlogManagementPage = () => {
    const [textFilter, setTextFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | BlogPostStatus>('all');
    const [page, setPage] = useState(1);
    const [newCategoryName, setNewCategoryName] = useState('');

    const listParams = useMemo(
        () => ({
            page,
            perPage: 20,
            text: textFilter.trim() || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
        }),
        [page, textFilter, statusFilter]
    );

    const { data, isLoading, isError } = useAdminBlogPosts(listParams);
    const { data: categories = [], isLoading: isLoadingCategories } = useAdminBlogCategories();
    const { mutateAsync: createCategory, isPending: isCreatingCategory } = useCreateBlogCategory();
    const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useDeleteBlogCategory();

    const { mutateAsync: publishPost, isPending: isPublishing } = usePublishBlogPost();
    const { mutateAsync: draftPost, isPending: isDrafting } = useDraftBlogPost();

    const posts = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / 20));

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            return;
        }

        await createCategory({
            categoryId: Uuid.generate().toString(),
            name,
        });

        setNewCategoryName('');
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Blog</h1>
                    <p className="text-muted-foreground">Gestiona posts, publicación y categorías del blog.</p>
                </div>

                <Link to="/dashboard/blog/new">
                    <Button className="gap-2">
                        <FilePlus2 size={16} />
                        Nuevo post
                    </Button>
                </Link>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-4">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categorías del blog</h2>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        placeholder="Nombre de categoría"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                void handleCreateCategory();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        className="gap-2"
                        onClick={() => void handleCreateCategory()}
                        disabled={isCreatingCategory}
                    >
                        <Plus size={14} />
                        Añadir categoría
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {isLoadingCategories && (
                        <p className="text-sm text-muted-foreground">Cargando categorías...</p>
                    )}

                    {!isLoadingCategories && categories.length === 0 && (
                        <p className="text-sm text-muted-foreground">Todavía no hay categorías.</p>
                    )}

                    {!isLoadingCategories && categories.map((category) => (
                        <div key={category.categoryId} className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm">
                            <span>{category.name}</span>
                            <button
                                type="button"
                                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
                                onClick={() => void deleteCategory(category.categoryId)}
                                disabled={isDeletingCategory}
                                aria-label={`Eliminar categoría ${category.name}`}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Input
                        value={textFilter}
                        onChange={(event) => {
                            setTextFilter(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por título o contenido..."
                        className="md:col-span-2"
                    />

                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value as 'all' | BlogPostStatus);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="draft">Borrador</SelectItem>
                            <SelectItem value="scheduled">Programado</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
                <div className="grid grid-cols-[2fr,120px,120px,120px,340px] gap-3 border-b bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <p>Título</p>
                    <p>Estado</p>
                    <p>Publicado</p>
                    <p>Programado</p>
                    <p className="text-right">Acciones</p>
                </div>

                {isLoading && (
                    <div className="space-y-2 p-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-12 animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="p-4 text-sm text-destructive">No se pudieron cargar los posts.</div>
                )}

                {!isLoading && !isError && posts.length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground">No hay posts con los filtros actuales.</div>
                )}

                {!isLoading && !isError && posts.length > 0 && (
                    <div className="divide-y">
                        {posts.map((post) => (
                            <div
                                key={post.postId}
                                className="grid grid-cols-[2fr,120px,120px,120px,340px] items-center gap-3 px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium leading-tight">{post.title}</p>
                                    {post.category && (
                                        <p className="text-xs text-muted-foreground">{post.category.name}</p>
                                    )}
                                    <p className="truncate text-xs text-muted-foreground">/{post.slug}</p>
                                </div>

                                <Badge className={`w-fit border ${statusBadgeClass[post.status]}`}>
                                    {statusLabels[post.status]}
                                </Badge>

                                <p className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(post.scheduledFor)}</p>

                                <div className="flex items-center justify-end gap-2">
                                    {post.slug && (
                                        <Link to={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm">
                                                Ver publicación
                                            </Button>
                                        </Link>
                                    )}

                                    <Link to={`/dashboard/blog/${post.postId}`}>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Edit3 size={14} />
                                            Editar
                                        </Button>
                                    </Link>

                                    {post.status !== 'published' && (
                                        <Button
                                            size="sm"
                                            onClick={() => void publishPost(post.postId)}
                                            disabled={isPublishing}
                                        >
                                            Publicar
                                        </Button>
                                    )}

                                    {post.status !== 'draft' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => void draftPost(post.postId)}
                                            disabled={isDrafting}
                                        >
                                            Borrador
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                >
                    Anterior
                </Button>

                <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                </p>

                <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
};

export default BlogManagementPage;
