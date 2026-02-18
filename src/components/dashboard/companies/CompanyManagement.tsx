import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, RotateCcw, Search, Users } from "lucide-react";

import DataTable from "../common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminCompanies } from "@/application/hooks/useAdminCompanies";
import type { CompanyAdminSummary } from "@/domain/models/CompanyAdminSummary";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/domain/models/UserRole";

const PLAN_LABELS: Record<CompanyAdminSummary["planType"], string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
};

const STATUS_LABELS: Record<CompanyAdminSummary["subscriptionStatus"], string> = {
    active: "Activa",
    paused: "Pausada",
    canceled: "Cancelada",
};

const STATUS_STYLES: Record<CompanyAdminSummary["subscriptionStatus"], string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    paused: "bg-amber-100 text-amber-700 border-amber-200",
    canceled: "bg-rose-100 text-rose-700 border-rose-200",
};

const CompanyManagement = () => {
    const navigate = useNavigate();
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN) ?? false;
    const [searchQuery, setSearchQuery] = useState("");
    const {
        companies,
        total,
        isLoading,
        error,
        applyFilters,
        reload,
    } = useAdminCompanies(isAdmin);

    useEffect(() => {
        if (isAdmin) {
            return;
        }

        const companyId = currentUser?.companyId;
        if (companyId) {
            navigate(`/dashboard/companies/${companyId}`, { replace: true });
        }
    }, [currentUser?.companyId, isAdmin, navigate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const normalized = searchQuery.trim();
        applyFilters({ name: normalized.length > 0 ? normalized : undefined });
    };

    const clearSearch = () => {
        setSearchQuery("");
        applyFilters({});
    };

    const handleEditCompany = (company: CompanyAdminSummary) => {
        navigate(`/dashboard/companies/${company.id}`);
    };

    const handleManageUsers = (companyId: string) => {
        navigate(`/dashboard/companies/${companyId}/users`);
    };

    const columns = [
        { key: "name", header: "Nombre" },
        { key: "slug", header: "Slug" },
        {
            key: "plan",
            header: "Plan",
            cell: (company: CompanyAdminSummary) => PLAN_LABELS[company.planType],
        },
        {
            key: "status",
            header: "Suscripcion",
            cell: (company: CompanyAdminSummary) => (
                <Badge className={STATUS_STYLES[company.subscriptionStatus]}>
                    {STATUS_LABELS[company.subscriptionStatus]}
                </Badge>
            ),
        },
        {
            key: "founding",
            header: "Early Bird",
            cell: (company: CompanyAdminSummary) =>
                company.isFoundingAccount ? "Si" : "No",
        },
        {
            key: "contactEmail",
            header: "Email",
            cell: (company: CompanyAdminSummary) => company.contactEmail ?? "-",
        },
        {
            key: "manage",
            header: "Gestionar",
            cell: (company: CompanyAdminSummary) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleManageUsers(company.id)}
                >
                    <Users size={14} />
                    Usuarios
                </Button>
            ),
        },
    ];

    const actions = [
        {
            label: "Editar",
            icon: <Edit size={16} />,
            onClick: (company: CompanyAdminSummary) => handleEditCompany(company),
        },
    ];

    return (
        <div className="space-y-6 p-6">
            {isAuthLoading && (
                <div className="p-6 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!isAuthLoading && !isAdmin && !currentUser?.companyId && (
                <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                        Esta vista de empresas esta disponible solo para administradores.
                    </p>
                </div>
            )}

            {!isAuthLoading && isAdmin && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Empresas y suscripciones</h1>
                            <p className="text-sm text-muted-foreground">
                                {total} empresas registradas en la plataforma.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 w-full sm:w-auto"
                            onClick={() => {
                                void reload();
                            }}
                        >
                            <RotateCcw size={16} />
                            Recargar
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre"
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" className="sm:w-auto">
                            Buscar
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="sm:w-auto"
                            onClick={clearSearch}
                        >
                            Limpiar
                        </Button>
                    </form>
                </div>
            )}

            {!isAuthLoading && isAdmin && isLoading && (
                <div className="p-6 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!isAuthLoading && isAdmin && !isLoading && error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                            void reload();
                        }}
                    >
                        Reintentar
                    </Button>
                </div>
            )}

            {!isAuthLoading && isAdmin && !isLoading && !error && (
                <DataTable
                    data={companies}
                    columns={columns}
                    actions={actions}
                    emptyMessage="No se encontraron empresas"
                />
            )}
        </div>
    );
};

export default CompanyManagement;
