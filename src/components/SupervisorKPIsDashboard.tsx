
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Target, Calendar, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SupervisorSalesKPIs from './supervisor/SupervisorSalesKPIs';
import SupervisorVisitKPIs from './supervisor/SupervisorVisitKPIs';
import SupervisorTeamOverview from './supervisor/SupervisorTeamOverview';

interface SupervisorKPIsDashboardProps {
  onBack: () => void;
}

const SupervisorKPIsDashboard: React.FC<SupervisorKPIsDashboardProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for selector
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch supervised delegates
  const { data: supervisedDelegates = [], isLoading: delegatesLoading } = useQuery({
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

  if (delegatesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team KPIs...</p>
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
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team KPIs Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Performance overview for {supervisedDelegates.length} team members
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              supervisedDelegates={supervisedDelegates}
            />

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
    </div>
  );
};

export default SupervisorKPIsDashboard;
