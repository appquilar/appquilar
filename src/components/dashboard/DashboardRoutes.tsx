
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductsManagement from './ProductsManagement';
import ProductFormPage from './products/ProductFormPage';
import RentalsManagement from './RentalsManagement';
import MessagesDashboard from './MessagesDashboard';
import UserManagement from './UserManagement';
import CompanyStats from './CompanyStats';

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyStats />} />
      <Route path="stats" element={<CompanyStats />} />
      <Route path="products" element={<ProductsManagement />} />
      <Route path="products/new" element={<ProductFormPage />} />
      <Route path="products/edit/:productId" element={<ProductFormPage />} />
      <Route path="rentals" element={<RentalsManagement />} />
      <Route path="messages" element={<MessagesDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;
