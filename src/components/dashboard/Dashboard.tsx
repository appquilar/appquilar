
import React from 'react';
import DashboardNavigation from './navigation/DashboardNavigation';
import DashboardRoutes from './DashboardRoutes';
import DashboardLayout from './layout/DashboardLayout';

/**
 * Main dashboard component that composes the layout with navigation and routes
 */
const Dashboard = () => {
  return (
    <DashboardLayout
      sidebar={<DashboardNavigation />}
      content={<DashboardRoutes />}
    />
  );
};

export default Dashboard;
