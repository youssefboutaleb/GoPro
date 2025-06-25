
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Target, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const DelegateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut, signOutLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigateToVisitReport = () => {
    navigate('/delegate/visit-report');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delegate Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {profile?.first_name} {profile?.last_name}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Activity Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Track your visits, manage your schedule, and monitor your performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={handleNavigateToVisitReport}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Visit Reports</CardTitle>
              <p className="text-gray-600 text-sm">
                View your visit history and performance metrics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Schedule</CardTitle>
              <p className="text-gray-600 text-sm">
                Coming soon - Manage your visit schedule
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Performance</CardTitle>
              <p className="text-gray-600 text-sm">
                Coming soon - Personal performance analytics
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DelegateDashboard;
