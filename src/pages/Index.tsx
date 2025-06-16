
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Users, Package, ShoppingCart, LogOut, User, Globe, Settings } from 'lucide-react';
import DoctorsList from '@/components/DoctorsList';
import ProductsList from '@/components/ProductsList';
import SimpleReturnIndex from '@/components/SimpleReturnIndex';
import SimpleVisitReport from '@/components/SimpleVisitReport';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

type View = 'dashboard' | 'doctors' | 'products' | 'returnIndex' | 'visitReport';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAdminRedirect = () => {
    window.location.href = '/admin';
  };

  if (currentView === 'doctors') {
    return <DoctorsList onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'products') {
    return <ProductsList onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'returnIndex') {
    return <SimpleReturnIndex onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'visitReport') {
    return <SimpleVisitReport onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  GOPRO
                </h1>
                <p className="text-sm text-gray-600">Medical Performance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {user && (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{t('common.userConnected')}</span>
                  </div>
                  {profile?.role === 'Admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAdminRedirect}
                      className="flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('common.admin')}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('common.signOut')}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('header.welcome')}
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {t('header.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
                onClick={() => window.location.href = '/auth'}
              >
                {t('header.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                onClick={() => window.location.href = '/auth'}
              >
                {t('header.signIn')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Return Index Card */}
          <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                onClick={() => setCurrentView('returnIndex')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{t('dashboard.returnIndex')}</CardTitle>
                    <p className="text-sm text-gray-600">{t('dashboard.returnIndexDesc')}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-600">{t('dashboard.totalDoctors')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-600">{t('dashboard.bySpecialty')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-600">{t('dashboard.byBrick')}</div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
                {t('dashboard.consultIndex')}
              </Button>
            </CardContent>
          </Card>

          {/* Recruitment Rate Card */}
          <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                onClick={() => setCurrentView('products')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg group-hover:from-green-600 group-hover:to-green-700 transition-all">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{t('dashboard.recruitmentRate')}</CardTitle>
                    <p className="text-sm text-gray-600">{t('dashboard.recruitmentRateDesc')}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-gray-600">{t('dashboard.products')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-600">{t('dashboard.averageGoal')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">0%</div>
                  <div className="text-xs text-gray-600">Performance</div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 group-hover:bg-green-50 group-hover:border-green-300 transition-colors">
                {t('dashboard.consultRate')}
              </Button>
            </CardContent>
          </Card>

          {/* Doctors Card */}
          <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                onClick={() => setCurrentView('doctors')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{t('doctors.targetedDoctors')}</CardTitle>
                    <p className="text-sm text-gray-600">Manage and view doctor profiles</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Total doctors in system</div>
              </div>
              <Button variant="outline" className="w-full mt-4 group-hover:bg-purple-50 group-hover:border-purple-300 transition-colors">
                View All Doctors
              </Button>
            </CardContent>
          </Card>

          {/* Visit Report Card */}
          <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                onClick={() => setCurrentView('visitReport')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg group-hover:from-orange-600 group-hover:to-orange-700 transition-all">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Visit Report</CardTitle>
                    <p className="text-sm text-gray-600">Track visits and performance</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Total visits this month</div>
              </div>
              <Button variant="outline" className="w-full mt-4 group-hover:bg-orange-50 group-hover:border-orange-300 transition-colors">
                View Visit Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
