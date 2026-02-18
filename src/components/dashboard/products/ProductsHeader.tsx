
import { Package } from "lucide-react";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";

const ProductsHeader = () => {
  return (
    <DashboardSectionHeader
      title="Productos"
      description="Gestiona tu inventario de alquiler."
      icon={Package}
    />
  );
};

export default ProductsHeader;
