import { useCallback, useEffect, useState } from "react";
import type { CompanyAdminSummary } from "@/domain/models/CompanyAdminSummary";
import type {
    CompanyAdminFilters,
    PaginatedAdminCompaniesResult,
} from "@/domain/repositories/CompanyAdminRepository";
import { compositionRoot } from "@/compositionRoot";

const { companyAdminService } = compositionRoot;

export interface UseAdminCompaniesApi extends PaginatedAdminCompaniesResult {
    isLoading: boolean;
    error: string | null;
    filters: CompanyAdminFilters;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    applyFilters: (filters: CompanyAdminFilters) => void;
    reload: () => Promise<void>;
}

export const useAdminCompanies = (enabled = true): UseAdminCompaniesApi => {
    const [companies, setCompanies] = useState<CompanyAdminSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filters, setFilters] = useState<CompanyAdminFilters>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCompanies = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await companyAdminService.listCompanies({
                ...filters,
                page,
                perPage,
            });

            setCompanies(result.companies);
            setTotal(result.total);
        } catch (err) {
            console.error("Error loading admin companies:", err);
            setError("Error al cargar las empresas. Intentalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, page, perPage]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void loadCompanies();
    }, [enabled, loadCompanies]);

    const applyFilters = (newFilters: CompanyAdminFilters) => {
        setPage(1);
        setFilters(newFilters);
    };

    const reload = async () => {
        await loadCompanies();
    };

    return {
        companies,
        total,
        page,
        perPage,
        isLoading,
        error,
        filters,
        setPage,
        setPerPage,
        applyFilters,
        reload,
    };
};
