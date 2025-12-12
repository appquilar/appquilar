import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePlatformUsers } from "@/application/hooks/usePlatformUsers";
import UserManagementHeader from "./user-management/UserManagementHeader";
import UserSearchForm from "./user-management/UserSearchForm";
import UserTable from "./user-management/UserTable";
import ResultsCount from "./user-management/ResultsCount";

const UserManagement = () => {
    const navigate = useNavigate();

    const {
        users,
        total,
        page,
        perPage,
        filters,
        isLoading,
        error,
        setPage,
        applyFilters,
    } = usePlatformUsers();

    const [lastAppliedFilters, setLastAppliedFilters] = useState(filters);

    const handleSearch = (newFilters: {
        id?: string;
        email?: string;
        name?: string;
    }) => {
        setLastAppliedFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleEditUser = (userId: string) => {
        navigate(`/dashboard/users/${encodeURIComponent(userId)}`);
    };

    const handleViewProducts = (userId: string) => {
        // Página aún no implementada – dejamos la navegación preparada
        navigate(`/dashboard/users/${encodeURIComponent(userId)}/products`);
    };

    const handleViewRentals = (userId: string) => {
        // Página aún no implementada – futuro /dashboard/users/:id/rentals
        navigate(`/dashboard/users/${encodeURIComponent(userId)}/rentals`);
    };

    return (
        <div className="space-y-6 max-w-full">
            <UserManagementHeader />

            <UserSearchForm
                filters={lastAppliedFilters}
                onSearch={handleSearch}
                isSearching={isLoading}
            />

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                    {error}
                </div>
            )}

            <ResultsCount visibleCount={users.length} total={total} />

            <UserTable
                users={users}
                isLoading={isLoading}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onEdit={handleEditUser}
                onViewProducts={handleViewProducts}
                onViewRentals={handleViewRentals}
            />
        </div>
    );
};

export default UserManagement;
