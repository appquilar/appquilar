import { useEffect, useMemo, useState } from 'react';
import { useRentals } from '@/application/hooks/useRentals';
import { useOwnedProductsCount } from '@/application/hooks/useProducts';
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

  const renterAvailabilityQuery = useRentals({
    role: 'renter',
    page: 1,
    perPage: 1,
  }, { enabled: isUserLoaded });

  const renterPastAvailabilityQuery = useRentals({
    role: 'renter',
    timeline: 'past',
    page: 1,
    perPage: 1,
  }, { enabled: isUserLoaded });

  const ownerAvailabilityQuery = useRentals({
    role: 'owner',
    ownerId: ownerReferenceId,
    page: 1,
    perPage: 1,
  }, { enabled: isUserLoaded && Boolean(ownerReferenceId) });

  const ownerPastAvailabilityQuery = useRentals({
    role: 'owner',
    ownerId: ownerReferenceId,
    timeline: 'past',
    page: 1,
    perPage: 1,
  }, { enabled: isUserLoaded && Boolean(ownerReferenceId) });

  const ownedProductsCountQuery = useOwnedProductsCount({
    ownerId: ownerReferenceId,
    ownerType,
  });

  const ownedPublishedProductsCountQuery = useOwnedProductsCount({
    ownerId: ownerReferenceId,
    ownerType,
    filters: {
      publicationStatus: 'published',
    },
  });

  const ownedArchivedProductsCountQuery = useOwnedProductsCount({
    ownerId: ownerReferenceId,
    ownerType,
    filters: {
      publicationStatus: 'archived',
    },
  });

  const hasRentsAsRenter = renterAvailabilityQuery.total > 0;
  const hasPastRentsAsRenter = renterPastAvailabilityQuery.total > 0;
  const hasRentsAsOwner = ownerAvailabilityQuery.total > 0;
  const hasPastRentsAsOwner = ownerPastAvailabilityQuery.total > 0;

  const totalOwnedProducts = ownedProductsCountQuery.data ?? 0;
  const archivedOwnedProducts = ownedArchivedProductsCountQuery.data ?? 0;
  const hasPublishedProductsForRent = (ownedPublishedProductsCountQuery.data ?? 0) > 0;
  const hasNonArchivedProductsForRent = Math.max(0, totalOwnedProducts - archivedOwnedProducts) > 0;

  const isRoleAvailabilityLoading = isUserLoaded && (
    renterAvailabilityQuery.isLoading ||
    renterPastAvailabilityQuery.isLoading ||
    ownerAvailabilityQuery.isLoading ||
    ownerPastAvailabilityQuery.isLoading ||
    ownedProductsCountQuery.isLoading ||
    ownedPublishedProductsCountQuery.isLoading ||
    ownedArchivedProductsCountQuery.isLoading
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
