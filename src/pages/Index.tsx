
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdminDashboard from "@/components/AdminDashboard";
import SupervisorDashboard from "@/components/SupervisorDashboard";
import SalesDirectorKPIsDashboard from "@/components/SalesDirectorKPIsDashboard";
import VisitReport from "@/components/VisitReport";
import ProgressiveAuthLoader from "@/components/common/ProgressiveAuthLoader";

const Index = () => {
  const { user, profile, loading } = useAuth();

  console.log('Index page - Auth state:', {
    userExists: !!user,
    profileExists: !!profile,
    userRole: profile?.role,
    loading,
    timestamp: new Date().toISOString()
  });

  // Show loading state only for initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Progressive loading - show UI immediately when user exists
  const renderDashboard = () => {
    // Show basic functionality even without full profile
    if (!profile) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.email}
              </h1>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      );
    }

    // Render role-based dashboard when profile is available
    switch (profile.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Supervisor':
        return <SupervisorDashboard />;
      case 'Sales Director':
        return <SalesDirectorKPIsDashboard />;
      case 'Delegate':
        return <VisitReport />;
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome, {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-600">
                Role: {profile.role}
              </p>
              <p className="text-gray-500 mt-2">
                Dashboard configuration pending...
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <ProgressiveAuthLoader
      fallback={
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.email}
              </h1>
              <p className="text-gray-600">Setting up your dashboard...</p>
            </div>
          </div>
        </div>
      }
    >
      {renderDashboard()}
    </ProgressiveAuthLoader>
  );
};

export default Index;
