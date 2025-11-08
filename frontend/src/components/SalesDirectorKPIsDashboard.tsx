
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Target, Award, Building, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SalesDirectorOverview from './sales-director/SalesDirectorOverview';
import SalesDirectorSalesKPIs from './sales-director/SalesDirectorSalesKPIs';
import SalesDirectorVisitKPIs from './sales-director/SalesDirectorVisitKPIs';
import SalesDirectorTeamStructure from './sales-director/SalesDirectorTeamStructure';

interface SalesDirectorKPIsDashboardProps {
  onBack: () => void;
}

const SalesDirectorKPIsDashboard: React.FC<SalesDirectorKPIsDashboardProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate month names for selector
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayMonths = monthNames.slice(0, currentMonth);

  // Fetch supervised supervisors
  const { data: supervisedSupervisors = [], isLoading: supervisorsLoading } = useQuery({
    queryKey: ['supervised-supervisors', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'Sales Director') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id, role')
        .eq('supervisor_id', profile.id)
        .eq('role', 'Supervisor');

      if (error) {
        console.error('Error fetching supervised supervisors:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'Sales Director',
  });

  // Fetch all delegates under all supervisors
  const { data: allDelegates = [], isLoading: delegatesLoading } = useQuery({
    queryKey: ['all-delegates-under-supervision', supervisedSupervisors.map(s => s.id)],
    queryFn: async () => {
      if (supervisedSupervisors.length === 0) return [];
      
      const supervisorIds = supervisedSupervisors.map(s => s.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, supervisor_id')
        .in('supervisor_id', supervisorIds)
        .eq('role', 'Delegate');

      if (error) {
        console.error('Error fetching all delegates:', error);
        throw error;
      }

      return data || [];
    },
    enabled: supervisedSupervisors.length > 0,
  });

  const delegateIds = allDelegates.map(d => d.id);
  const supervisorIds = supervisedSupervisors.map(s => s.id);

  if (supervisorsLoading || delegatesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Sales Director KPIs...</p>
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
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Sales Director KPIs</h1>
                  <p className="text-sm text-gray-600">
                    Aggregated performance across {supervisedSupervisors.length} supervisors and {allDelegates.length} delegates
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
        {supervisedSupervisors.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Supervisors Found</h3>
              <p className="text-gray-600">
                You don't have any supervised supervisors yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview Cards */}
            <SalesDirectorOverview 
              supervisedSupervisors={supervisedSupervisors}
              allDelegates={allDelegates}
              selectedMonth={selectedMonth}
            />

            {/* Team Structure */}
            <SalesDirectorTeamStructure 
              supervisedSupervisors={supervisedSupervisors}
              allDelegates={allDelegates}
            />

            {/* Sales Performance KPIs */}
            <SalesDirectorSalesKPIs 
              delegateIds={delegateIds}
              supervisorIds={supervisorIds}
              selectedMonth={selectedMonth}
              currentYear={currentYear}
            />

            {/* Visit Effectiveness KPIs */}
            <SalesDirectorVisitKPIs 
              delegateIds={delegateIds}
              supervisorIds={supervisorIds}
              selectedMonth={selectedMonth}
              currentYear={currentYear}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SalesDirectorKPIsDashboard;
