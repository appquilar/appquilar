import { Users } from "lucide-react";
import DashboardSectionHeader from "@/components/dashboard/common/DashboardSectionHeader";

const UserManagementHeader: React.FC = () => {
    return (
        <DashboardSectionHeader
            title="Usuarios"
            description="Consulta y administra los usuarios de la plataforma."
            icon={Users}
        />
    );
};

export default UserManagementHeader;
