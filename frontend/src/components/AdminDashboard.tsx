
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Building, UserCheck, Calendar, Package, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { Profile } from '@/types/auth';
import DoctorsManager from '@/components/admin/DoctorsManager';
import UsersManager from '@/components/admin/UsersManager';
import VisitsManager from '@/components/admin/VisitsManager';
import SectorsBricksManager from '@/components/admin/SectorsBricksManager';
import ReportsManager from '@/components/admin/ReportsManager';
import ProductsManager from '@/components/ProductsManager';
import SalesManager from '@/components/SalesManager';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface AdminDashboardProps {
  onSignOut: () => void;
  signOutLoading: boolean;
  profile: Profile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSignOut, signOutLoading, profile }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [currentSection, setCurrentSection] = useState<string>('dashboard');

  const handleSectionClick = (section: string) => {
    setCurrentSection(section);
  };

  const handleBackToDashboard = () => {
    setCurrentSection('dashboard');
  };

  // Render specific management components
  if (currentSection === 'profiles') {
    return <UsersManager onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'sectors-bricks') {
    return <SectorsBricksManager onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'doctors') {
    return <DoctorsManager onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'visits') {
    return <VisitsManager onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'products') {
    return <ProductsManager onBack={handleBackToDashboard} />;
  }

  if (currentSection === 'sales') {
    return <SalesManager onBack={handleBackToDashboard} />;
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('admin:adminDashboard')}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {t('common:welcome')}, {profile.first_name} {profile.last_name} ({t('admin:administrator')})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
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
      </div>

      {/* Admin Management Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Profiles Management */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('profiles')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('admin:profilesManagement')}</CardTitle>
                  <CardDescription>{t('admin:manageUsers')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin:clickToManageProfiles')}</p>
            </CardContent>
          </Card>

          {/* Sectors and Bricks Management */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('sectors-bricks')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('admin:sectorsAndBricks')}</CardTitle>
                  <CardDescription>{t('admin:manageSectorsBricks')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin:clickToManageSectorsBricks')}</p>
            </CardContent>
          </Card>

          {/* Doctors Management */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('doctors')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('admin:doctorsManagement')}</CardTitle>
                  <CardDescription>{t('admin:manageDoctors')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin:clickToManageDoctors')}</p>
            </CardContent>
          </Card>

          {/* Visits Management */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('visits')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('admin:visitsManagement')}</CardTitle>
                  <CardDescription>{t('admin:manageVisits')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin:clickToManageVisits')}</p>
            </CardContent>
          </Card>

          {/* Products Management */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('products')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('admin:productsManagement')}</CardTitle>
                  <CardDescription>{t('admin:manageProducts')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin:clickToManageProducts')}</p>
            </CardContent>
          </Card>

          {/* Sales Management */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0"
            onClick={() => handleSectionClick('sales')}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('admin:salesManagement')}</CardTitle>
                  <CardDescription>{t('admin:manageSales')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin:clickToManageSales')}</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
