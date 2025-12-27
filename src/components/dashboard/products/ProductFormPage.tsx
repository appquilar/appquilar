// src/pages/dashboard/products/ProductFormPage.tsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "@/components/dashboard/forms/ProductForm";
import { useCreateProduct, useUpdateProduct } from "@/application/hooks/useProducts";
import type { ProductFormData } from "@/domain/models/Product";
import { useProductById } from "@/application/hooks/useProductById";
import {Uuid} from "@/domain/valueObject/uuidv4.ts";

const ProductFormPage = () => {
    const navigate = useNavigate();
    const { productId } = useParams<{ productId: string }>();

    const isEdit = !!productId;

    const create = useCreateProduct();
    const update = useUpdateProduct(productId ?? "");
    const productQuery = useProductById(productId ?? null);

    const defaultValues = useMemo<Partial<ProductFormData> | undefined>(() => {
        if (!isEdit) return undefined;
        if (!productQuery.data) return undefined;

        // ⚠️ Aquí depende de tu repo: si ya devuelve shape de form, OK.
        // Pero garantizamos images como string[] si te llega como image_ids.
        const d: any = productQuery.data as any;

        return {
            ...d,
            images: d.images ?? d.image_ids ?? [],
            categoryId: d.categoryId ?? d.category_id,
            companyId: d.companyId ?? d.company_id ?? "",
            internalId: d.internalId ?? d.internal_id ?? "",
        };
    }, [isEdit, productQuery.data]);

    const submit = async (data: ProductFormData) => {
        const imageIds = (data.images ?? [])
            .map((x: any) => (typeof x === "string" ? x : x?.id))
            .filter(Boolean);

        const payload: ProductFormData = {
            ...data,
            images: imageIds as any, // ✅ ahora ya es string[]
        };

        if (isEdit) {
            await update.mutateAsync(payload);
        } else {
            await create.mutateAsync({
                ...payload,
                id: Uuid.generate().toString(),
            });
        }

        navigate("/dashboard/products");
    };

    if (isEdit && productQuery.isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (isEdit && productQuery.error) {
        return (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                No se pudo cargar el producto
            </div>
        );
    }

    return <ProductForm onSubmit={submit} defaultValues={defaultValues} />;
};

export default ProductFormPage;
