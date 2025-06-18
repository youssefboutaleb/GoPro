import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, TrendingUp, Calendar, Star, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface RythmeRecrutementProps {
  onBack: () => void;
}

interface UserInfo {
  id: string;
  role: string;
  created_at: string | null;
}

interface RecruitmentMetrics {
  totalUsers: number;
  newThisMonth: number;
  newThisQuarter: number;
  performanceRating: number;
  trend: 'up' | 'down' | 'stable';
}

const RythmeRecrutement: React.FC<RythmeRecrutementProps> = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users_recruitment'],
    queryFn: async () => {
      console.log('Fetching users for recruitment analysis...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
      return data as UserInfo[];
    }
  });

  // Calculate recruitment metrics
  const calculateMetrics = (): RecruitmentMetrics => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const totalUsers = users.length;
    
    // New users this month
    const newThisMonth = users.filter(user => {
      if (!user.created_at) return false;
      const createdDate = new Date(user.created_at);
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;

    // New users this quarter
    const quarterStart = Math.floor(currentMonth / 3) * 3;
    const newThisQuarter = users.filter(user => {
      if (!user.created_at) return false;
      const createdDate = new Date(user.created_at);
      const userMonth = createdDate.getMonth();
      return userMonth >= quarterStart && userMonth <= currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;

    // Simple performance rating based on recruitment rate
    const performanceRating = totalUsers > 0 ? Math.min(5, Math.ceil((newThisQuarter / totalUsers) * 100)) : 0;
    
    // Trend calculation (simplified)
    const trend: 'up' | 'down' | 'stable' = newThisMonth > 2 ? 'up' : newThisMonth === 0 ? 'down' : 'stable';

    return {
      totalUsers,
      newThisMonth,
      newThisQuarter,
      performanceRating,
      trend
    };
  };

  const metrics = calculateMetrics();

  // Filter users based on selected period
  const getFilteredUsers = () => {
    const now = new Date();
    let filteredByTime = users;

    if (selectedPeriod === 'month') {
      filteredByTime = users.filter(user => {
        if (!user.created_at) return false;
        const createdDate = new Date(user.created_at);
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      });
    } else if (selectedPeriod === 'quarter') {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      filteredByTime = users.filter(user => {
        if (!user.created_at) return false;
        const createdDate = new Date(user.created_at);
        const userMonth = createdDate.getMonth();
        return userMonth >= quarterStart && userMonth <= now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      });
    }

    return filteredByTime;
  };

  const filteredUsers = getFilteredUsers();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recruitment data</p>
          <Button onClick={onBack}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Recruitment Rhythm</h1>
                  <p className="text-sm text-gray-600">User recruitment analysis and trends</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                New recruits
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quarter Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.newThisQuarter}</div>
              <p className="text-xs text-muted-foreground">
                Q{Math.floor(new Date().getMonth() / 3) + 1} recruits
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{metrics.performanceRating}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < metrics.performanceRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Recruitment rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recruits Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">
                Recent Recruits - {selectedPeriod === 'month' ? 'This Month' : selectedPeriod === 'quarter' ? 'This Quarter' : 'This Year'}
              </CardTitle>
              <Badge className={`${
                metrics.trend === 'up' ? 'bg-green-100 text-green-800' :
                metrics.trend === 'down' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                Trend: {metrics.trend === 'up' ? '↗️ Rising' : metrics.trend === 'down' ? '↘️ Declining' : '→ Stable'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recruits found</h3>
                <p className="text-gray-600">No new users for the selected period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Registration Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {user.id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {user.role}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className="bg-blue-100 text-blue-800">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RythmeRecrutement;
