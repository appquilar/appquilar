import { Routes, Route, Navigate } from 'react-router-dom';
import ProductsManagement from './ProductsManagement';
import ProductFormPage from './products/ProductFormPage';
import RentalsManagement from './RentalsManagement';
import MessagesDashboard from './MessagesDashboard';
import UserManagement from './UserManagement';
import CompanyStats from './CompanyStats';

// Category pages
import CategoryManagement from './categories/CategoryManagement';
import CategoryFormPage from './categories/CategoryFormPage';

// Company pages
import CompanyManagement from './companies/CompanyManagement';
import CompanyFormPage from './companies/CompanyFormPage';
import CompanyUsersPage from './companies/CompanyUsersPage';
import CompanyProductsPage from './companies/CompanyProductsPage';

// Site pages
import SiteManagement from './sites/SiteManagement';
import SiteFormPage from './sites/SiteFormPage';

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyStats />} />
      <Route path="stats" element={<CompanyStats />} />
      
      {/* Products routes */}
      <Route path="products" element={<ProductsManagement />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/edit/:productId" element={<ProductFormPage />} />
      
      {/* Categories routes */}
      <Route path="categories" element={<CategoryManagement />} />
      <Route path="categories/new" element={<CategoryFormPage />} />
      <Route path="categories/edit/:categoryId" element={<CategoryFormPage />} />
      
      {/* Companies routes */}
      <Route path="companies" element={<CompanyManagement />} />
      <Route path="companies/new" element={<CompanyFormPage />} />
      <Route path="companies/edit/:companyId" element={<CompanyFormPage />} />
      <Route path="companies/:companyId/users" element={<CompanyUsersPage />} />
      <Route path="companies/:companyId/products" element={<CompanyProductsPage />} />
      
      {/* Sites routes */}
      <Route path="sites" element={<SiteManagement />} />
      <Route path="sites/new" element={<SiteFormPage />} />
      <Route path="sites/edit/:siteId" element={<SiteFormPage />} />
      
      {/* Other existing routes */}
      <Route path="rentals" element={<RentalsManagement />} />
      <Route path="messages" element={<MessagesDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;
