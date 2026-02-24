// src/components/dashboard/users/UserProductsPage.tsx  (ajusta ruta si difiere)

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Edit, Plus, Trash } from "lucide-react";

import FormHeader from "../common/FormHeader";
import DataTable from "../common/DataTable";
import { Button } from "@/components/ui/button";

import type { User } from "@/domain/models/User";
import type { ProductFormData } from "@/domain/models/Product";
import { compositionRoot } from "@/compositionRoot";

type RowProduct = ProductFormData & { id: string };

const UserProductsPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<RowProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const productService = compositionRoot.productService;
    const userService = compositionRoot.userService;

    useEffect(() => {
        if (!userId) {
            navigate("/dashboard/users");
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            try {
                const userData = await userService.getUserById(userId);
                if (!userData) {
                    toast.error("Usuario no encontrado");
                    navigate("/dashboard/users");
                    return;
                }
                setUser(userData);

                // ✅ Correcto: productos por owner user_id
                const result = await productService.listByOwner(userId, 1, 50);
                setProducts(result.data);
            } catch (error) {
                console.error("Error loading user products:", error);
                toast.error("Error al cargar los productos del usuario");
            } finally {
                setIsLoading(false);
            }
        };

        void loadData();
    }, [userId, navigate, userService, productService]);

    const columns = [
        {
            key: "name",
            header: "Nombre",
            cell: (product: RowProduct) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted overflow-hidden" />
                    <span className="font-medium">{product.name}</span>
                </div>
            ),
        },
        {
            key: "categoryId",
            header: "Categoría",
            cell: (product: RowProduct) => product.categoryId || "—",
        },
        {
            key: "price",
            header: "Precio por día",
            cell: (product: RowProduct) => `${Number(product.price?.daily ?? 0).toFixed(2)} €`,
        },
    ];

    const actions = [
        {
            label: "Editar",
            icon: <Edit size={16} />,
            onClick: (product: RowProduct) => navigate(`/dashboard/products/${product.id}/edit`),
        },
        {
            label: "Eliminar",
            icon: <Trash size={16} />,
            onClick: async (product: RowProduct) => {
                if (!confirm(`¿Estás seguro que deseas eliminar el producto: ${product.name}?`)) return;

                // ⚠️ No me has dado endpoint DELETE en Nelmio.
                // Si lo que quieres es "archivar", usa archive(product.id).
                try {
                    await productService.archive(product.id);
                    setProducts((prev) => prev.filter((p) => p.id !== product.id));
                    toast.success("Producto archivado correctamente");
                } catch (e) {
                    console.error(e);
                    toast.error("Error al archivar el producto");
                }
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
            <FormHeader title={`Productos de ${user?.firstName || user?.email || "Usuario"}`} backUrl="/dashboard/users" />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Lista de productos</h2>
                <Button onClick={() => navigate("/dashboard/products/new")} className="gap-2">
                    <Plus size={16} />
                    Nuevo Producto
                </Button>
            </div>

            <DataTable
                data={products}
                columns={columns}
                actions={actions}
                emptyMessage="Este usuario no tiene productos registrados"
            />
        </div>
    );
};

export default UserProductsPage;
