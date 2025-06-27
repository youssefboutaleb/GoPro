import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Building2, UserCheck, FileText, Calendar, ClipboardList } from 'lucide-react';
import UsersManager from './admin/UsersManager';
import SectorsBricksManager from './admin/SectorsBricksManager';
import DoctorsManager from './admin/DoctorsManager';
import ReportsManager from './admin/ReportsManager';
import VisitsManager from './admin/VisitsManager';
import ActionPlanList from './action-plans/ActionPlanList';
import { Profile } from '@/types/auth';

interface AdminDashboardProps {
  onSignOut: () => Promise<{ error: any }>;
  signOutLoading: boolean;
  profile: Profile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    const { error } = await onSignOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile.first_name}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="action-plans">Action Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Manage user accounts, roles, and permissions across the system.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('users')}
                  >
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Territory Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Configure sectors, bricks, and territorial organization.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('sectors')}
                  >
                    Manage Territories
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Doctor Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Manage doctor profiles, specialties, and assignments.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('doctors')}
                  >
                    Manage Doctors
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Visit Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Monitor and manage visit schedules and reports.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('visits')}
                  >
                    Manage Visits
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Action Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Create and manage action plans with approval workflows.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('action-plans')}
                  >
                    Manage Action Plans
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Generate comprehensive reports and analytics.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('reports')}
                  >
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UsersManager onBack={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="sectors">
            <SectorsBricksManager onBack={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorsManager onBack={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="visits">
            <VisitsManager onBack={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManager onBack={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="action-plans">
            <ActionPlanList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
