import { useEffect, useMemo, useState } from 'react';
import { useRentSummary, useRentals } from '@/application/hooks/useRentals';
import { useOwnerProductSummary } from '@/application/hooks/useProducts';
import { useCurrentUser } from '@/application/hooks/useCurrentUser';
import { RentalRoleTab, RentalStatusFilter } from '@/domain/models/RentalFilters';

const RENTALS_PER_PAGE = 9;

export const useRentalsData = () => {
  const { user } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<RentalStatusFilter>('pending');
  const [roleTab, setRoleTab] = useState<RentalRoleTab>('owner');
  const [currentPage, setCurrentPage] = useState(1);

  const ownerReferenceId = user?.companyId ?? user?.id ?? undefined;
  const ownerType = user?.companyId ? 'company' : 'user';
  const isUserLoaded = Boolean(user);

  const rentSummaryQuery = useRentSummary({
    ownerId: ownerReferenceId,
    enabled: isUserLoaded,
  });
  const ownerProductSummaryQuery = useOwnerProductSummary({
    ownerId: ownerReferenceId,
    ownerType,
    enabled: isUserLoaded && Boolean(ownerReferenceId),
  });

  const hasRentsAsRenter = (rentSummaryQuery.data?.renter.total ?? 0) > 0;
  const hasPastRentsAsRenter = (rentSummaryQuery.data?.renter.past ?? 0) > 0;
  const hasRentsAsOwner = (rentSummaryQuery.data?.owner.total ?? 0) > 0;
  const hasPastRentsAsOwner = (rentSummaryQuery.data?.owner.past ?? 0) > 0;

  const totalOwnedProducts = ownerProductSummaryQuery.data?.total ?? 0;
  const archivedOwnedProducts = ownerProductSummaryQuery.data?.archived ?? 0;
  const hasPublishedProductsForRent = (ownerProductSummaryQuery.data?.published ?? 0) > 0;
  const hasNonArchivedProductsForRent = Math.max(0, totalOwnedProducts - archivedOwnedProducts) > 0;

  const isRoleAvailabilityLoading = isUserLoaded && (
    rentSummaryQuery.isLoading ||
    ownerProductSummaryQuery.isLoading
  );

  const shouldForceRenterRole = !hasNonArchivedProductsForRent && !hasPastRentsAsOwner;
  const shouldForceOwnerRole = hasNonArchivedProductsForRent && !hasPastRentsAsRenter;

  const showRoleFilterByBusinessRule = (
    (hasRentsAsRenter && hasPublishedProductsForRent) ||
    hasRentsAsOwner ||
    hasRentsAsRenter
  );

  const showRoleFilter = !isRoleAvailabilityLoading &&
    !shouldForceRenterRole &&
    !shouldForceOwnerRole &&
    showRoleFilterByBusinessRule;

  const forcedRoleTab: RentalRoleTab = shouldForceRenterRole
    ? 'renter'
    : 'owner';

  const effectiveRoleTab: RentalRoleTab = showRoleFilter ? roleTab : forcedRoleTab;

  useEffect(() => {
    if (!isRoleAvailabilityLoading && !showRoleFilter && roleTab !== forcedRoleTab) {
      setRoleTab(forcedRoleTab);
    }
  }, [isRoleAvailabilityLoading, showRoleFilter, roleTab, forcedRoleTab]);

  const ownerId = effectiveRoleTab === 'owner' ? ownerReferenceId : undefined;

  const normalizedSearchQuery = searchQuery.trim();

  const {
    rentals,
    total,
    isLoading,
    error,
  } = useRentals({
    role: effectiveRoleTab,
    ownerId,
    search: normalizedSearchQuery.length > 0 ? normalizedSearchQuery : undefined,
    statusGroup: statusFilter,
    startDate,
    endDate,
    page: currentPage,
    perPage: RENTALS_PER_PAGE,
  }, { enabled: isUserLoaded && (effectiveRoleTab === 'renter' || Boolean(ownerId)) });

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearchQuery, startDate, endDate, statusFilter, effectiveRoleTab]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / RENTALS_PER_PAGE));
  }, [total]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    rentals,
    total,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    roleTab: effectiveRoleTab,
    setRoleTab,
    showRoleFilter,
    filteredRentals: rentals,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};
