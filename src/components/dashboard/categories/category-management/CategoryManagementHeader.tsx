import React from "react";
import { Button } from "@/components/ui/button";

const CategoryManagementHeader: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold">Categorías</h1>
                <p className="text-sm text-muted-foreground">
                    Busca y gestiona las categorías de la plataforma.
                </p>
            </div>

            <Button onClick={onCreate}>Crear categoría</Button>
        </div>
    );
};

export default CategoryManagementHeader;
