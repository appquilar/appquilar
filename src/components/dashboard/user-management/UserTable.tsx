import React from "react";
import { Edit, Package2, ClipboardIcon, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { User } from "@/domain/models/User";
import { UserRole } from "@/domain/models/UserRole";
import { toast } from "sonner";

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onEdit: (userId: string) => void;
    onViewProducts: (userId: string) => void;
    onViewRentals: (userId: string) => void;
}

const renderRoleBadge = (role: UserRole) => {
    switch (role) {
        case UserRole.ADMIN:
            return <Badge variant="default">Admin</Badge>;
        case UserRole.REGULAR_USER:
            return <Badge variant="outline">Usuario</Badge>;
        case UserRole.COMPANY_ADMIN:
            return <Badge variant="secondary">Company admin</Badge>;
        default:
            return <Badge variant="outline">{role}</Badge>;
    }
};

const UserTable: React.FC<UserTableProps> = ({
                                                 users,
                                                 isLoading,
                                                 onEdit,
                                                 onViewProducts,
                                                 onViewRentals,
                                             }) => {
    const handleCopyId = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            toast.success("ID copiado al portapapeles");
        } catch (err) {
            console.error("Error copying ID:", err);
            toast.error("No se ha podido copiar el ID");
        }
    };

    return (
        <div className="border rounded-md overflow-hidden">
            <TooltipProvider>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead className="w-[220px] text-right">
                                Acciones
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-8"
                                >
                                    <p className="text-muted-foreground">
                                        Cargando usuarios...
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && users.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-8"
                                >
                                    <p className="text-muted-foreground">
                                        No se encontraron usuarios
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.firstName}{" "}
                                                {user.lastName}
                                            </span>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCopyId(
                                                                user.id
                                                            )
                                                        }
                                                        className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        <ClipboardIcon
                                                            size={12}
                                                        />
                                                        <span>
                                                            {user.id}
                                                        </span>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-mono text-xs break-all max-w-xs">
                                                        {user.id}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.map((role) => (
                                                <span key={role}>
                                                    {renderRoleBadge(role)}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    onViewProducts(user.id)
                                                }
                                                title="Ver productos"
                                            >
                                                <Package2 size={16} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    onViewRentals(user.id)
                                                }
                                                title="Ver alquileres"
                                            >
                                                <Receipt size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    onEdit(user.id)
                                                }
                                                title="Editar usuario"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TooltipProvider>
        </div>
    );
};

export default UserTable;
