
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardComponent from '@/components/dashboard/Dashboard';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const { isLoggedIn, isLoading } = useAuth();
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardComponent />
    </div>
  );
};

// Wrapper component to provide auth context
const Dashboard = () => {
  return (
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>
  );
};

export default Dashboard;
