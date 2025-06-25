
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, Download, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const [refreshing, setRefreshing] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for selector
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Mock data for demonstration - replace with actual data fetching
  const kpiData = [
    {
      title: 'Team Achievement Rate',
      value: 85.2,
      target: 100,
      previousValue: 78.5,
      trend: 'up' as const,
      status: 'online' as const,
      category: 'performance' as const
    },
    {
      title: 'Total Sales YTD',
      value: 1247,
      target: 1500,
      previousValue: 1156,
      trend: 'up' as const,
      status: 'online' as const,
      category: 'sales' as const
    },
    {
      title: 'Visits Completed',
      value: 324,
      target: 400,
      previousValue: 298,
      trend: 'up' as const,
      status: 'online' as const,
      category: 'visits' as const
    },
    {
      title: 'Active Team Members',
      value: 8,
      target: 10,
      previousValue: 7,
      trend: 'up' as const,
      status: 'online' as const,
      category: 'team' as const
    }
  ];

  // Mock trend data
  const trendData = [
    { period: 'Jan', value: 950, target: 1200 },
    { period: 'Feb', value: 1100, target: 1200 },
    { period: 'Mar', value: 1247, target: 1200 },
    { period: 'Apr', value: 1180, target: 1300 },
    { period: 'May', value: 1350, target: 1300 },
    { period: 'Jun', value: 1420, target: 1400 }
  ];

  // Mock ranking data
  const rankingData = [
    { id: '1', name: 'John Doe', value: 156, target: 120, rank: 1, trend: 'up' as const },
    { id: '2', name: 'Jane Smith', value: 143, target: 120, rank: 2, trend: 'up' as const },
    { id: '3', name: 'Mike Johnson', value: 138, target: 120, rank: 3, trend: 'stable' as const },
    { id: '4', name: 'Sarah Wilson', value: 125, target: 120, rank: 4, trend: 'up' as const },
    { id: '5', name: 'Tom Brown', value: 118, target: 120, rank: 5, trend: 'down' as const }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting data...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Enhanced Team KPIs Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Real-time performance overview with advanced analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Interactive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <InteractiveKPICard
              key={index}
              data={kpi}
              onViewDetails={() => console.log('View details for', kpi.title)}
              onExport={() => console.log('Export data for', kpi.title)}
            />
          ))}
        </div>

        {/* Trend Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            title="Sales Performance Trend"
            data={trendData}
            type="line"
            color="#10b981"
            showTarget={true}
          />
          <TrendChart
            title="Monthly Achievements"
            data={trendData}
            type="bar"
            color="#3b82f6"
            showTarget={false}
          />
        </div>

        {/* Performance Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceRanking
            title="Top Performers - Sales"
            data={rankingData}
            metric="sales"
            showTop={5}
          />
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Team Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <AnimatedProgressBar
                  value={1247}
                  max={1500}
                  label="Total Sales Target"
                  color="green"
                />
                <AnimatedProgressBar
                  value={324}
                  max={400}
                  label="Visit Completion"
                  color="blue"
                />
                <AnimatedProgressBar
                  value={85.2}
                  max={100}
                  label="Overall Performance"
                  color="yellow"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSupervisorDashboard;
