import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import RoleGuard from "@/components/auth/RoleGuard";
import { UserRole } from "@/domain/models/UserRole";

const DashboardOverview = lazy(() => import("./overview/DashboardOverview"));
const ProductsManagement = lazy(() => import("@/components/dashboard/ProductsManagement"));
const ProductFormPage = lazy(() => import("./products/ProductFormPage"));
const UserManagement = lazy(() => import("@/components/dashboard/UserManagement"));
const EditUserPage = lazy(() => import("@/pages/dashboard/users/EditUser"));
const MessagesDashboard = lazy(() => import("./MessagesDashboard"));
const RentalsPage = lazy(() => import("@/pages/dashboard/rentals/RentalsPage"));
const CompanyManagement = lazy(() => import("./companies/CompanyManagement"));
const CompanyFormPage = lazy(() => import("./companies/CompanyFormPage"));
const CompanyProductsPage = lazy(() => import("./companies/CompanyProductsPage"));
const CompanyUsersPage = lazy(() => import("./companies/CompanyUsersPage"));
const CategoryManagement = lazy(() => import("./categories/CategoryManagement"));
const CategoryFormPage = lazy(() => import("./categories/CategoryFormPage"));
const UserConfigPage = lazy(() => import("./config/UserConfigPage"));
const UpgradePage = lazy(() => import("./upgrade/UpgradePage"));
const CreateRental = lazy(() => import("@/pages/dashboard/rentals/CreateRental"));
const RentalDetails = lazy(() => import("@/pages/dashboard/rentals/RentalDetails"));
const UserProductsPage = lazy(() => import("./users/UserProductsPage"));
const SiteSettingsPage = lazy(() => import("./sites/SiteSettingsPage"));
const BlogManagementPage = lazy(() => import("@/components/dashboard/blog/BlogManagementPage"));
const BlogEditorPage = lazy(() => import("@/components/dashboard/blog/BlogEditorPage"));

const DashboardRouteFallback = () => (
    <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
);

const withRouteSuspense = (element: ReactNode) => (
    <Suspense fallback={<DashboardRouteFallback />}>
        {element}
    </Suspense>
);

const DashboardRoutes = () => {
    return (
        <Routes>
            <Route index element={withRouteSuspense(<DashboardOverview />)} />

            <Route path="products" element={withRouteSuspense(<ProductsManagement />)} />
            <Route path="products/new" element={withRouteSuspense(<ProductFormPage />)} />
            <Route path="products/:productId/edit" element={withRouteSuspense(<ProductFormPage />)} />
            <Route path="products/:productId" element={withRouteSuspense(<ProductFormPage />)} />

            <Route path="rentals" element={withRouteSuspense(<RentalsPage />)} />
            <Route path="rentals/new" element={withRouteSuspense(<CreateRental />)} />
            <Route path="rentals/:id" element={withRouteSuspense(<RentalDetails />)} />

            <Route path="companies" element={withRouteSuspense(<CompanyManagement />)} />
            <Route path="companies/new" element={withRouteSuspense(<CompanyFormPage />)} />
            <Route path="companies/:id" element={withRouteSuspense(<CompanyFormPage />)} />
            <Route
                path="companies/:companyId/products"
                element={withRouteSuspense(<CompanyProductsPage />)}
            />
            <Route
                path="companies/:companyId/users"
                element={withRouteSuspense(<CompanyUsersPage />)}
            />

            <Route
                path="categories"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <CategoryManagement />
                    </RoleGuard>
                )}
            />
            <Route
                path="categories/new"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <CategoryFormPage />
                    </RoleGuard>
                )}
            />
            <Route
                path="categories/:id"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <CategoryFormPage />
                    </RoleGuard>
                )}
            />

            <Route
                path="blog"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <BlogManagementPage />
                    </RoleGuard>
                )}
            />
            <Route
                path="blog/new"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <BlogEditorPage />
                    </RoleGuard>
                )}
            />
            <Route
                path="blog/:postId"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <BlogEditorPage />
                    </RoleGuard>
                )}
            />

            <Route
                path="sites"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <SiteSettingsPage />
                    </RoleGuard>
                )}
            />

            <Route
                path="users"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <UserManagement />
                    </RoleGuard>
                )}
            />
            <Route
                path="users/:userId"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <EditUserPage />
                    </RoleGuard>
                )}
            />
            <Route
                path="users/:userId/products"
                element={withRouteSuspense(
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <UserProductsPage />
                    </RoleGuard>
                )}
            />

            <Route path="messages" element={withRouteSuspense(<MessagesDashboard />)} />
            <Route path="config" element={withRouteSuspense(<UserConfigPage />)} />
            <Route path="upgrade" element={withRouteSuspense(<UpgradePage />)} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default DashboardRoutes;
