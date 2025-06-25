
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Building, UserCheck, Calendar, Package, TrendingUp, Users, ArrowLeft, BarChart3, Sparkles } from 'lucide-react';
import { Profile } from '@/types/auth';
import SupervisorKPIsDashboard from './SupervisorKPIsDashboard';
import EnhancedSupervisorDashboard from './enhanced-kpis/EnhancedSupervisorDashboard';
import RythmeRecrutement from './RythmeRecrutement';

interface SupervisorDashboardProps {
  onSignOut: () => void;
  signOutLoading: boolean;
  profile: Profile;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [currentSection, setCurrentSection] = useState<string>('dashboard');

  const handleSectionClick = (section: string) => {
    setCurrentSection(section);
  };

  const handleBackToDashboard = () => {
    setCurrentSection('dashboard');
  };

  // Render specific management components
  if (currentSection === 'kpis') {
    return <SupervisorKPIsDashboard onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'enhanced-kpis') {
    return <EnhancedSupervisorDashboard onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'rythme-recrutement') {
    return <RythmeRecrutement onBack={handleBackToDashboard} />;
  }

  // Main Supervisor Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
              <p className="text-lg text-gray-600 mt-1">
                {t('common:welcome')}, {profile.first_name} {profile.last_name} (Supervisor)
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onSignOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? t('common:signingOut') : t('common:signOut')}
            </Button>
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Enhanced KPIs Dashboard - NEW */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            onClick={() => handleSectionClick('enhanced-kpis')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Enhanced KPIs Dashboard</CardTitle>
                  <CardDescription>Advanced analytics with real-time indicators</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Interactive KPIs, trend analysis, and performance rankings</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  NEW
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Team KPIs */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('kpis')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Team KPIs Dashboard</CardTitle>
                  <CardDescription>Monitor team performance metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View sales and visit performance for your team</p>
            </CardContent>
          </Card>

          {/* Rythme de Recrutement */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('rythme-recrutement')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rythme de Recrutement</CardTitle>
                  <CardDescription>Analyze recruitment rhythm and sales plans</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Track sales performance and recruitment patterns</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
