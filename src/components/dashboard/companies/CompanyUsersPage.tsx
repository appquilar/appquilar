import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import FormHeader from "../common/FormHeader";
import { CompanyUsersTable } from "./users/CompanyUsersTable";
import { InviteUserDialog } from "./users/InviteUserDialog";
import { useAuth } from "@/context/AuthContext";
import {
    useCompanyUsers,
    useInviteCompanyUser,
    useRemoveCompanyUser,
    useUpdateCompanyUserRole,
} from "@/application/hooks/useCompanyMembership";
import type { CompanyUserRole } from "@/domain/models/CompanyMembership";
import { UserRole } from "@/domain/models/UserRole";

const CompanyUsersPage = () => {
    const { companyId: routeCompanyId } = useParams();
    const { currentUser } = useAuth();
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    const effectiveCompanyId = routeCompanyId ?? currentUser?.companyId ?? null;
    const isPlatformAdmin = currentUser?.roles?.includes(UserRole.ADMIN) ?? false;
    const isCompanyOwner = currentUser?.isCompanyOwner === true;
    const canManage = isPlatformAdmin || isCompanyOwner;

    const usersQuery = useCompanyUsers(effectiveCompanyId);
    const inviteMutation = useInviteCompanyUser();
    const removeMutation = useRemoveCompanyUser();
    const updateRoleMutation = useUpdateCompanyUserRole();

    const companyName = useMemo(() => {
        return currentUser?.companyName ?? "Empresa";
    }, [currentUser?.companyName]);

    if (!effectiveCompanyId) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">
                    No hay empresa asociada a tu usuario.
                </p>
            </div>
        );
    }

    if (currentUser?.companyId && currentUser.companyId !== effectiveCompanyId && !isPlatformAdmin) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">
                    No tienes permisos para gestionar esta empresa.
                </p>
            </div>
        );
    }

    const handleInviteUser = async (data: { email: string; role: CompanyUserRole }) => {
        try {
            await inviteMutation.mutateAsync({
                companyId: effectiveCompanyId,
                email: data.email,
                role: data.role,
            });
            toast.success("Invitación enviada correctamente.");
            setInviteDialogOpen(false);
        } catch (error) {
            console.error("Error inviting company user", error);
            toast.error("No se pudo enviar la invitación.");
        }
    };

    const handleRoleChange = async (userId: string, role: CompanyUserRole) => {
        try {
            await updateRoleMutation.mutateAsync({
                companyId: effectiveCompanyId,
                userId,
                role,
            });
            toast.success("Rol actualizado correctamente.");
        } catch (error) {
            console.error("Error updating user role", error);
            toast.error("No se pudo actualizar el rol.");
        }
    };

    const handleRemoveUser = async (userId: string) => {
        try {
            await removeMutation.mutateAsync({
                companyId: effectiveCompanyId,
                userId,
            });
            toast.success("Usuario eliminado de la empresa.");
        } catch (error) {
            console.error("Error removing company user", error);
            toast.error("No se pudo eliminar el usuario.");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <FormHeader
                title={`Gestión de usuarios - ${companyName}`}
                backUrl="/dashboard/companies"
            />

            {!canManage && (
                <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    Solo el propietario de la empresa puede gestionar usuarios.
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-medium">Usuarios de la empresa</h2>
                {canManage && (
                    <Button
                        onClick={() => setInviteDialogOpen(true)}
                        className="gap-2"
                        disabled={inviteMutation.isPending}
                    >
                        <Mail size={16} />
                        Invitar usuario
                    </Button>
                )}
            </div>

            {usersQuery.isLoading && (
                <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}

            {usersQuery.isError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    No se pudieron cargar los usuarios de empresa.
                </div>
            )}

            {!usersQuery.isLoading && !usersQuery.isError && (
                <CompanyUsersTable
                    users={usersQuery.data ?? []}
                    canManage={canManage}
                    onRoleChange={handleRoleChange}
                    onRemoveUser={handleRemoveUser}
                    isMutating={removeMutation.isPending || updateRoleMutation.isPending}
                />
            )}

            <InviteUserDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                onSubmit={handleInviteUser}
                disabled={!canManage || inviteMutation.isPending}
            />
        </div>
    );
};

export default CompanyUsersPage;
