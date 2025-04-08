
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardOverview from './overview/DashboardOverview';
import ProductsManagement from './products/ProductsManagement';
import ProductFormPage from './products/ProductFormPage';
import UserManagement from './user-management/UserManagement';
import MessagesDashboard from './MessagesDashboard';
import RentalsManagement from './rentals/RentalsManagement';
import CompanyManagement from './companies/CompanyManagement';
import CompanyFormPage from './companies/CompanyFormPage';
import CompanyProductsPage from './companies/CompanyProductsPage';
import CompanyUsersPage from './companies/CompanyUsersPage';
import CategoryManagement from './categories/CategoryManagement';
import CategoryFormPage from './categories/CategoryFormPage';
import SiteManagement from './sites/SiteManagement';
import SiteFormPage from './sites/SiteFormPage';
import UserConfigPage from './config/UserConfigPage';
import UpgradePage from './upgrade/UpgradePage';
import CreateRental from '@/pages/dashboard/rentals/CreateRental';
import RentalDetails from '@/pages/dashboard/rentals/RentalDetails';

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<DashboardOverview />} />
      
      {/* Products */}
      <Route path="products" element={<ProductsManagement />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/:id" element={<ProductFormPage />} />
      
      {/* Rentals */}
      <Route path="rentals" element={<RentalsManagement />} />
      <Route path="rentals/new" element={<CreateRental />} />
      <Route path="rentals/:id" element={<RentalDetails />} />
      
      {/* Companies */}
      <Route path="companies" element={<CompanyManagement />} />
      <Route path="companies/new" element={<CompanyFormPage />} />
      <Route path="companies/:id" element={<CompanyFormPage />} />
      <Route path="companies/:id/products" element={<CompanyProductsPage />} />
      <Route path="companies/:id/users" element={<CompanyUsersPage />} />
      
      {/* Categories */}
      <Route path="categories" element={<CategoryManagement />} />
      <Route path="categories/new" element={<CategoryFormPage />} />
      <Route path="categories/:id" element={<CategoryFormPage />} />
      
      {/* Sites */}
      <Route path="sites" element={<SiteManagement />} />
      <Route path="sites/new" element={<SiteFormPage />} />
      <Route path="sites/:id" element={<SiteFormPage />} />
      
      {/* Users */}
      <Route path="users" element={<UserManagement />} />
      
      {/* Messages */}
      <Route path="messages" element={<MessagesDashboard />} />
      
      {/* User Configuration */}
      <Route path="config" element={<UserConfigPage />} />
      
      {/* Upgrade */}
      <Route path="upgrade" element={<UpgradePage />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;
