import React from "react";
import { Grid2X2Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";

const CategoryManagementHeader: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
    return (
        <DashboardSectionHeader
            title="Categorías"
            description="Busca y gestiona las categorías de la plataforma."
            icon={Grid2X2Plus}
            actions={<Button onClick={onCreate}>Crear categoría</Button>}
        />
    );
};

export default CategoryManagementHeader;
