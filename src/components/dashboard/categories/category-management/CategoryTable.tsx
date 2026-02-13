import React from "react";
import { ClipboardIcon, Edit, Package2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Category } from "@/domain/models/Category";

interface CategoryTableProps {
    categories: Category[];
    isLoading: boolean;
    onEdit: (categoryId: string) => void;
    onViewProducts: (categoryId: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
                                                         categories,
                                                         isLoading,
                                                         onEdit,
                                                         onViewProducts,
                                                     }) => {
    const handleCopyId = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            toast.success("ID copiado al portapapeles");
        } catch (err) {
            console.error("Error copying ID:", err);
            toast.error("No se ha podido copiar el ID");
        }
    };

    return (
        <div className="border rounded-md overflow-hidden">
            <TooltipProvider>
                <Table className="min-w-[720px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="w-[180px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <p className="text-muted-foreground">Cargando categorías...</p>
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <p className="text-muted-foreground">No se encontraron categorías</p>
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>

                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyId(category.id)}
                                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    <ClipboardIcon size={12} />
                                                    <span className="font-mono">{category.id}</span>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-mono text-xs break-all max-w-xs">{category.id}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell className="font-mono text-xs">{category.slug}</TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onViewProducts(category.id)}
                                                title="Ver productos (no implementado aún)"
                                            >
                                                <Package2 size={16} />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(category.id)}
                                                title="Editar categoría"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TooltipProvider>
        </div>
    );
};

export default CategoryTable;
