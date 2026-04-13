import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import FormHeader from "../common/FormHeader";
import LoadingSpinner from "../common/LoadingSpinner";

import CategoryForm from "./form/CategoryForm";
import {
    useCategoryEditor,
    type CategoryFormValues,
} from "./hooks/useCategoryEditor";

const CategoryFormPage = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();
    const {
        defaultValues,
        error,
        isCreateMode,
        isLoading,
        isSubmitting,
        saveCategory,
    } = useCategoryEditor(categoryId);

    useEffect(() => {
        if (!error) {
            return;
        }

        toast.error(error);
        navigate("/dashboard/categories");
    }, [error, navigate]);

    const handleSubmit = async (data: CategoryFormValues) => {

        try {
            const result = await saveCategory(data);
            toast.success(
                result === "created"
                    ? "Categoría creada correctamente"
                    : "Categoría actualizada correctamente"
            );
            navigate("/dashboard/categories");
        } catch (e) {
            console.error("Error saving category:", e);
            toast.error(
                isCreateMode
                    ? "Error al crear la categoría"
                    : "Error al actualizar la categoría"
            );
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <FormHeader
                title={isCreateMode ? "Crear Categoría" : "Editar Categoría"}
                backUrl="/dashboard/categories"
            />

            <CategoryForm
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/dashboard/categories")}
                categoryId={isCreateMode ? undefined : categoryId}
            />
        </div>
    );
};

export default CategoryFormPage;
