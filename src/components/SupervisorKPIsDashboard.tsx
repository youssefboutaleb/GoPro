
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Target, Calendar, BarChart3, Download, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SupervisorSalesKPIs from './supervisor/SupervisorSalesKPIs';
import SupervisorVisitKPIs from './supervisor/SupervisorVisitKPIs';
import SupervisorTeamOverview from './supervisor/SupervisorTeamOverview';
import SupervisorTeamReturnIndex from './SupervisorTeamReturnIndex';
import RythmeRecrutement from './RythmeRecrutement';
import BreadcrumbNavigation from './common/BreadcrumbNavigation';
import SearchBar from './common/SearchBar';
import FloatingActionButton from './common/FloatingActionButton';
import SkeletonCard from './common/SkeletonCard';

interface SupervisorKPIsDashboardProps {
  onBack: () => void;
}

const SupervisorKPIsDashboard: React.FC<SupervisorKPIsDashboardProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTeamReturnIndex, setShowTeamReturnIndex] = useState(false);
  const [showRecruitmentRhythm, setShowRecruitmentRhythm] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for selector
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch supervised delegates
  const { data: supervisedDelegates = [], isLoading: delegatesLoading, refetch } = useQuery({
    queryKey: ['supervised-delegates', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Supervisor') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching supervised delegates:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Supervisor',
  });

  const delegateIds = supervisedDelegates.map(d => d.id);

  // Filter delegates based on search
  const filteredDelegates = supervisedDelegates.filter(delegate =>
    `${delegate.first_name} ${delegate.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExportData = () => {
    console.log('Exporting team KPI data...');
    // Mock export functionality
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const floatingActions = [
    {
      label: 'Refresh Data',
      icon: RefreshCw,
      onClick: handleRefresh,
      color: 'bg-blue-600'
    },
    {
      label: 'Export Report',
      icon: Download,
      onClick: handleExportData,
      color: 'bg-green-600'
    }
  ];

  const breadcrumbItems = [
    { label: 'Team Management', onClick: onBack },
    { label: 'Team KPIs' }
  ];

  // Show Team Return Index Dashboard
  if (showTeamReturnIndex) {
    return (
      <SupervisorTeamReturnIndex
        onBack={() => setShowTeamReturnIndex(false)}
        delegateIds={delegateIds}
      />
    );
  }

  // Show Recruitment Rhythm with supervisor filters
  if (showRecruitmentRhythm) {
    return (
      <RythmeRecrutement
        onBack={() => setShowRecruitmentRhythm(false)}
        delegateIds={delegateIds}
        supervisorName={`${profile?.first_name} ${profile?.last_name}`}
        showDelegateFilter={true}
      />
    );
  }

  if (delegatesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <BreadcrumbNavigation items={breadcrumbItems} onBack={onBack} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <BreadcrumbNavigation items={breadcrumbItems} onBack={onBack} />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Team KPIs Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Performance overview for {supervisedDelegates.length} team members
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <SearchBar
                placeholder="Search team members..."
                onSearch={handleSearch}
                value={searchQuery}
                className="flex-1 sm:w-64"
              />
              
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-28 sm:w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {displayMonths.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {supervisedDelegates.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Team Members Found</h3>
              <p className="text-gray-600">
                You don't have any supervised delegates yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Team Overview */}
            <SupervisorTeamOverview 
              delegateIds={delegateIds}
              selectedMonth={selectedMonth}
              supervisedDelegates={filteredDelegates.length > 0 ? filteredDelegates : supervisedDelegates}
            />

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Return Index Dashboard Card */}
              <Card 
                className="bg-white/80 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-indigo-200"
                onClick={() => setShowTeamReturnIndex(true)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Team Return Index Dashboard</CardTitle>
                  <p className="text-gray-600 text-sm mb-4">
                    Comprehensive visit effectiveness analysis for your team
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    Click to view detailed analysis →
                  </div>
                </CardContent>
              </Card>

              {/* Recruitment Rhythm Card */}
              <Card 
                className="bg-white/80 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-purple-200"
                onClick={() => setShowRecruitmentRhythm(true)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Recruitment Rhythm</CardTitle>
                  <p className="text-gray-600 text-sm mb-4">
                    Sales performance and recruitment analysis with advanced filters
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                    Click to view recruitment analysis →
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Performance KPIs */}
            <SupervisorSalesKPIs 
              delegateIds={delegateIds}
              selectedMonth={selectedMonth}
              currentYear={currentYear}
            />

            {/* Visit Effectiveness KPIs */}
            <SupervisorVisitKPIs 
              delegateIds={delegateIds}
              selectedMonth={selectedMonth}
              currentYear={currentYear}
            />
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton actions={floatingActions} />
    </div>
  );
};

export default SupervisorKPIsDashboard;
