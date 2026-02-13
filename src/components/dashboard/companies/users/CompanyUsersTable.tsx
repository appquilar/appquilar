import { Trash2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { COMPANY_USER_ROLES } from "@/application/hooks/useCompanyMembership";
import type {
    CompanyUserMembership,
    CompanyUserRole,
} from "@/domain/models/CompanyMembership";

const roleLabelMap: Record<CompanyUserRole, string> = {
    ROLE_ADMIN: "Administrador",
    ROLE_CONTRIBUTOR: "Colaborador",
};

const statusLabelMap: Record<string, string> = {
    ACCEPTED: "Aceptado",
    PENDING: "Pendiente",
    EXPIRED: "Expirado",
};

interface CompanyUsersTableProps {
    users: CompanyUserMembership[];
    canManage: boolean;
    onRoleChange: (userId: string, role: CompanyUserRole) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    isMutating?: boolean;
}

export const CompanyUsersTable = ({
    users,
    canManage,
    onRoleChange,
    onRemoveUser,
    isMutating = false,
}: CompanyUsersTableProps) => {
    if (users.length === 0) {
        return (
            <div className="rounded-lg bg-muted/30 py-12 text-center">
                <h3 className="mb-2 text-lg font-medium">Sin usuarios de empresa</h3>
                <p className="text-muted-foreground">
                    Aún no hay usuarios asociados a esta empresa.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table className="min-w-[640px]">
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={`${user.companyId}:${user.userId ?? user.email}`}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {canManage && user.userId ? (
                                    <Select
                                        value={user.role}
                                        onValueChange={(value) => {
                                            void onRoleChange(user.userId!, value as CompanyUserRole);
                                        }}
                                        disabled={isMutating}
                                    >
                                        <SelectTrigger className="w-full min-w-[140px] sm:w-[170px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMPANY_USER_ROLES.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span>{roleLabelMap[user.role] ?? user.role}</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">
                                    {statusLabelMap[user.status] ?? user.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {canManage && user.userId && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            void onRemoveUser(user.userId!);
                                        }}
                                        disabled={isMutating}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar usuario</span>
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
