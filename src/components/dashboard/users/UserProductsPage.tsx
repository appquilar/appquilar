import { useNavigate, useParams } from "react-router-dom";
import { Edit, Plus, Trash } from "lucide-react";

import FormHeader from "../common/FormHeader";
import DataTable from "../common/DataTable";
import { Button } from "@/components/ui/button";

import type { Product } from "@/domain/models/Product";
import { useUserById } from "@/application/hooks/useUserById";
import { useDashboardProducts, useDeleteProduct } from "@/application/hooks/useProducts";

const UserProductsPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const userQuery = useUserById(userId);
    const productsQuery = useDashboardProducts({
        ownerId: userId,
        ownerType: 'user',
        page: 1,
        perPage: 50,
        enabled: Boolean(userId),
    });
    const deleteProduct = useDeleteProduct();

    if (!userId) {
        navigate("/dashboard/users");
        return null;
    }

    const products = productsQuery.data?.data ?? [];
    const isLoading = userQuery.isLoading || productsQuery.isLoading;

    const getDailyPrice = (product: Product): number => {
        const tierPrice = product.price.tiers?.[0]?.pricePerDay;
        return typeof tierPrice === "number" ? tierPrice : Number(product.price.daily ?? 0);
    };

    const columns = [
        {
            key: "name",
            header: "Nombre",
            cell: (product: Product) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                        {(product.thumbnailUrl || product.imageUrl) && (
                            <img
                                src={product.thumbnailUrl || product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>
                    <span className="font-medium">{product.name}</span>
                </div>
            ),
        },
        {
            key: "category",
            header: "Categoría",
            cell: (product: Product) => product.category.name || "—",
        },
        {
            key: "price",
            header: "Precio por día",
            cell: (product: Product) => `${getDailyPrice(product).toFixed(2)} €`,
        },
    ];

    const actions = [
        {
            label: "Editar",
            icon: <Edit size={16} />,
            onClick: (product: Product) => navigate(`/dashboard/products/${product.id}/edit`),
        },
        {
            label: "Archivar",
            icon: <Trash size={16} />,
            onClick: async (product: Product) => {
                await deleteProduct.mutateAsync(product.id);
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FormHeader
                title={`Productos de ${userQuery.user?.firstName || userQuery.user?.email || "Usuario"}`}
                backUrl="/dashboard/users"
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Lista de productos</h2>
                <Button onClick={() => navigate("/dashboard/products/new")} className="gap-2">
                    <Plus size={16} />
                    Nuevo Producto
                </Button>
            </div>

            <DataTable<Product>
                data={products}
                columns={columns}
                actions={actions}
                emptyMessage="Este usuario no tiene productos registrados"
            />
        </div>
    );
};

export default UserProductsPage;
