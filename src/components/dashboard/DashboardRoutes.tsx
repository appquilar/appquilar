import { Routes, Route, Navigate } from "react-router-dom";
import DashboardOverview from "./overview/DashboardOverview";
import ProductsManagement from "@/components/dashboard/ProductsManagement";
import ProductFormPage from "./products/ProductFormPage";
import UserManagement from "@/components/dashboard/UserManagement";
import EditUserPage from "@/pages/dashboard/users/EditUser";
import MessagesDashboard from "./MessagesDashboard";
import RentalsPage from "@/pages/dashboard/rentals/RentalsPage";
import CompanyManagement from "./companies/CompanyManagement";
import CompanyFormPage from "./companies/CompanyFormPage";
import CompanyProductsPage from "./companies/CompanyProductsPage";
import CompanyUsersPage from "./companies/CompanyUsersPage";
import CategoryManagement from "./categories/CategoryManagement";
import CategoryFormPage from "./categories/CategoryFormPage";
import SiteManagement from "./sites/SiteManagement";
import SiteFormPage from "./sites/SiteFormPage";
import UserConfigPage from "./config/UserConfigPage";
import UpgradePage from "./upgrade/UpgradePage";
import CreateRental from "@/pages/dashboard/rentals/CreateRental";
import RentalDetails from "@/pages/dashboard/rentals/RentalDetails";
import UserProductsPage from "./users/UserProductsPage";
import SiteSettingsPage from "./sites/SiteSettingsPage";
import BlogManagementPage from "@/components/dashboard/blog/BlogManagementPage";
import BlogEditorPage from "@/components/dashboard/blog/BlogEditorPage";

import RoleGuard from "@/components/auth/RoleGuard";
import { UserRole } from "@/domain/models/UserRole";

const DashboardRoutes = () => {
    return (
        <Routes>
            {/* Resumen */}
            <Route index element={<DashboardOverview />} />

            {/* Products */}
            <Route path="products" element={<ProductsManagement />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:productId/edit" element={<ProductFormPage />} />
            <Route path="products/:productId" element={<ProductFormPage />} />

            {/* Rentals */}
            <Route path="rentals" element={<RentalsPage />} />
            <Route path="rentals/new" element={<CreateRental />} />
            <Route path="rentals/:id" element={<RentalDetails />} />

            <Route path="companies" element={<CompanyManagement />} />
            <Route path="companies/new" element={<CompanyFormPage />} />
            <Route path="companies/:id" element={<CompanyFormPage />} />
            <Route
                path="companies/:companyId/products"
                element={<CompanyProductsPage />}
            />
            <Route
                path="companies/:companyId/users"
                element={<CompanyUsersPage />}
            />

            <Route
                path="categories"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <CategoryManagement />
                    </RoleGuard>
                }
            />
            <Route
                path="categories/new"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <CategoryFormPage />
                    </RoleGuard>
                }
            />
            <Route
                path="categories/:id"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <CategoryFormPage />
                    </RoleGuard>
                }
            />

            {/* Blog (🔒 sólo ADMIN) */}
            <Route
                path="blog"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <BlogManagementPage />
                    </RoleGuard>
                }
            />
            <Route
                path="blog/new"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <BlogEditorPage />
                    </RoleGuard>
                }
            />
            <Route
                path="blog/:postId"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <BlogEditorPage />
                    </RoleGuard>
                }
            />

            {/* Sites (🔒 sólo ADMIN) */}
            <Route
                path="sites"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <SiteSettingsPage />
                    </RoleGuard>
                }
            />

            {/* Users (🔒 sólo ADMIN) */}
            <Route
                path="users"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <UserManagement />
                    </RoleGuard>
                }
            />
            <Route
                path="users/:userId"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <EditUserPage />
                    </RoleGuard>
                }
            />
            <Route
                path="users/:userId/products"
                element={
                    <RoleGuard requiredRoles={[UserRole.ADMIN]}>
                        <UserProductsPage />
                    </RoleGuard>
                }
            />

            {/* Mensajes (cualquier usuario logado) */}
            <Route path="messages" element={<MessagesDashboard />} />

            {/* Configuración usuario (cualquier usuario logado) */}
            <Route path="config" element={<UserConfigPage />} />

            {/* Upgrade (cualquier usuario logado) */}
            <Route path="upgrade" element={<UpgradePage />} />

            {/* Fallback → índice del dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default DashboardRoutes;
