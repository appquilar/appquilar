import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import FormHeader from "../common/FormHeader";
import LoadingSpinner from "../common/LoadingSpinner";

import { categoryService } from "@/compositionRoot";
import type { CategoryUpsertPayload } from "@/domain/models/Category";

import CategoryForm from "./form/CategoryForm";

type FormValues = Omit<CategoryUpsertPayload, "id">;

const CategoryFormPage = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();

    const isAddMode = !categoryId || categoryId === "new";

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [defaultValues, setDefaultValues] = useState<FormValues>({
        name: "",
        slug: "",
        description: null,
        parentId: null,
        iconId: null,
        featuredImageId: null,
        landscapeImageId: null,
    });

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);

            try {
                if (!isAddMode && categoryId) {
                    const category = await categoryService.getById(categoryId);

                    setDefaultValues({
                        name: category.name,
                        slug: category.slug,
                        description: category.description ?? null,
                        parentId: category.parentId ?? null,
                        iconId: category.iconId ?? null,
                        featuredImageId: category.featuredImageId ?? null,
                        landscapeImageId: category.landscapeImageId ?? null,
                    });
                }
            } catch (e) {
                console.error("Error loading category:", e);
                toast.error("Error al cargar la categoría");
                navigate("/dashboard/categories");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [categoryId, isAddMode, navigate]);

    const handleSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        try {
            if (isAddMode) {
                const newId = crypto.randomUUID(); // ✅ FE genera el ID

                await categoryService.create({
                    id: newId,
                    ...data,
                });

                toast.success("Categoría creada correctamente");

                // Mantienes el comportamiento actual: volver al listado
                navigate("/dashboard/categories");
            } else {
                if (!categoryId) throw new Error("Missing categoryId");

                await categoryService.update({
                    id: categoryId,
                    ...data,
                });

                toast.success("Categoría actualizada correctamente");
                navigate("/dashboard/categories");
            }
        } catch (e) {
            console.error("Error saving category:", e);
            toast.error(isAddMode ? "Error al crear la categoría" : "Error al actualizar la categoría");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <FormHeader
                title={isAddMode ? "Crear Categoría" : "Editar Categoría"}
                backUrl="/dashboard/categories"
            />

            <CategoryForm
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/dashboard/categories")}
                categoryId={isAddMode ? undefined : categoryId}
            />
        </div>
    );
};

export default CategoryFormPage;
