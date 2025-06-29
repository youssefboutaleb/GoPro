
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, ClipboardList, LogOut } from "lucide-react";
import ProgressiveAuthLoader from "@/components/common/ProgressiveAuthLoader";

const Index = () => {
  const { user, profile, loading, signOut, signOutLoading } = useAuth();
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleReturnIndexClick = () => {
    navigate('/delegate/return-index');
  };

  const handleRecruitmentRateClick = () => {
    navigate('/delegate/recruitment-rate');
  };

  const handleActionPlansClick = () => {
    navigate('/action-plans');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {profile?.first_name || user.email}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={signOutLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {signOutLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Return Index Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Return Index
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4">
                  Analyze visit effectiveness and return rates for your assigned doctors.
                </p>
                <Button 
                  onClick={handleReturnIndexClick}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  View Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Recruitment Rate Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Recruitment Rate
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4">
                  Track recruitment progress and performance metrics across your territory.
                </p>
                <Button 
                  onClick={handleRecruitmentRateClick}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  View Metrics
                </Button>
              </CardContent>
            </Card>

            {/* Action Plans Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Action Plans
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4">
                  Manage and track action plans for strategic initiatives and improvements.
                </p>
                <Button 
                  onClick={handleActionPlansClick}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  Manage Plans
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User Info Section */}
          {profile && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">
                  Logged in as {profile.first_name} {profile.last_name} ({profile.role})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProgressiveAuthLoader>
  );
};

export default Index;
