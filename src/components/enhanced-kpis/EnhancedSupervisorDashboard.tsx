
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Target, Calendar, BarChart3, Download, RefreshCw, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BreadcrumbNavigation from '../common/BreadcrumbNavigation';
import SearchBar from '../common/SearchBar';
import FloatingActionButton from '../common/FloatingActionButton';
import SkeletonCard from '../common/SkeletonCard';
import NotificationCenter from '../common/NotificationCenter';
import ReportGenerator from '../common/ReportGenerator';
import DataExportManager from '../common/DataExportManager';
import RealTimeIndicator from './RealTimeIndicator';
import InteractiveKPICard from './InteractiveKPICard';
import TrendChart from './TrendChart';
import PerformanceRanking from './PerformanceRanking';
import AnimatedProgressBar from './AnimatedProgressBar';

interface EnhancedSupervisorDashboardProps {
  onBack: () => void;
}

const EnhancedSupervisorDashboard: React.FC<EnhancedSupervisorDashboardProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    console.log('Exporting enhanced KPI data...');
  };

  const handleGenerateReport = (config: any) => {
    console.log('Generating report with config:', config);
  };

  const handleExportManager = (config: any) => {
    console.log('Exporting data with config:', config);
  };

  const handleImportData = (file: File, dataType: string) => {
    console.log('Importing data:', file.name, 'Type:', dataType);
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
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => console.log('Settings clicked'),
      color: 'bg-gray-600'
    }
  ];

  const breadcrumbItems = [
    { label: 'Team Management', onClick: onBack },
    { label: 'Enhanced KPIs' }
  ];

  // Mock KPI data structured to match InteractiveKPICard interface
  const kpiCards = [
    {
      data: {
        title: 'Total Sales',
        value: 142500,
        target: 150000,
        previousValue: 135000,
        trend: 'up' as const,
        status: 'online' as const,
        category: 'sales' as const
      },
      onViewDetails: () => console.log('Sales KPI clicked'),
      onExport: () => console.log('Export sales data')
    },
    {
      data: {
        title: 'Visits Completed',
        value: 248,
        target: 280,
        previousValue: 220,
        trend: 'up' as const,
        status: 'online' as const,
        category: 'visits' as const
      },
      onViewDetails: () => console.log('Visits KPI clicked'),
      onExport: () => console.log('Export visits data')
    },
    {
      data: {
        title: 'Conversion Rate',
        value: 68,
        target: 75,
        previousValue: 62,
        trend: 'up' as const,
        status: 'online' as const,
        category: 'performance' as const
      },
      onViewDetails: () => console.log('Conversion KPI clicked'),
      onExport: () => console.log('Export conversion data')
    },
    {
      data: {
        title: 'Team Efficiency',
        value: 85,
        target: 90,
        previousValue: 82,
        trend: 'up' as const,
        status: 'online' as const,
        category: 'team' as const
      },
      onViewDetails: () => console.log('Efficiency KPI clicked'),
      onExport: () => console.log('Export efficiency data')
    }
  ];

  // Fix trend data structure to match ChartDataPoint interface
  const trendData = [
    { period: 'Jan', value: 120000, target: 140000 },
    { period: 'Feb', value: 135000, target: 145000 },
    { period: 'Mar', value: 142500, target: 150000 },
  ];

  // Transform team members data for PerformanceRanking
  const performanceData = (filteredDelegates.length > 0 ? filteredDelegates : supervisedDelegates).map((delegate, index) => ({
    id: delegate.id,
    name: `${delegate.first_name} ${delegate.last_name}`,
    value: Math.floor(Math.random() * 50000) + 20000, // Mock sales value
    target: 40000,
    rank: index + 1,
    trend: Math.random() > 0.5 ? 'up' as const : 'down' as const
  }));

  const teamPerformance = filteredDelegates.length > 0 ? filteredDelegates : supervisedDelegates;

  if (delegatesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="bg-white shadow-lg border-b border-purple-100">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Enhanced Header with Notifications */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <BreadcrumbNavigation items={breadcrumbItems} onBack={onBack} />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Enhanced KPIs Dashboard</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    Advanced analytics for {supervisedDelegates.length} team members
                  </p>
                  <RealTimeIndicator 
                    status="online"
                    label="System"
                    size="sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <NotificationCenter userId={profile?.id} />
              
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

              <div className="flex space-x-2">
                <ReportGenerator 
                  delegateIds={delegateIds}
                  onGenerateReport={handleGenerateReport}
                />
                <DataExportManager 
                  onExport={handleExportManager}
                  onImport={handleImportData}
                />
              </div>
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
            {/* Interactive KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((kpi, index) => (
                <InteractiveKPICard
                  key={index}
                  data={kpi.data}
                  onViewDetails={kpi.onViewDetails}
                  onExport={kpi.onExport}
                />
              ))}
            </div>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart 
                title="Performance Trends"
                data={trendData}
                type="line"
                color="#3b82f6"
                showTarget={true}
              />

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Target Achievement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatedProgressBar
                    value={142500}
                    max={150000}
                    label="Sales Target"
                    color="green"
                  />
                  <AnimatedProgressBar
                    value={248}
                    max={280}
                    label="Visit Target"
                    color="blue"
                  />
                  <AnimatedProgressBar
                    value={68}
                    max={75}
                    label="Conversion Target"
                    color="yellow"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Team Performance Ranking */}
            <PerformanceRanking 
              title="Team Performance"
              data={performanceData}
              metric="sales"
              showTop={5}
            />
          </>
        )}
      </div>

      {/* Enhanced Floating Action Button */}
      <FloatingActionButton actions={floatingActions} />
    </div>
  );
};

export default EnhancedSupervisorDashboard;
