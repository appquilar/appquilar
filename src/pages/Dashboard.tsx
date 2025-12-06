import {useEffect} from "react";
import {Navigate} from "react-router-dom";
import DashboardComponent from "@/components/dashboard/Dashboard";
import {useAuth} from "@/context/AuthContext";

/**
 * Top-level dashboard route component.
 *
 * - Uses the global AuthProvider defined in App.tsx.
 * - Redirects unauthenticated users to the public home page.
 */
const Dashboard = () => {
    const { isLoggedIn, isLoading } = useAuth();

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // While auth state is being resolved, show a loading indicator
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // If the user is not logged in, redirect to the public home page
    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    // Authenticated user → show dashboard layout
    return (
        <div className="min-h-screen flex flex-col overflow-hidden">
            <DashboardComponent />
        </div>
    );
};

export default Dashboard;
