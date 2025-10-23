
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, Filter, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SupervisorTeamReturnIndexProps {
  onBack: () => void;
  delegateIds: string[];
}

interface VisitPlanData {
  id: string;
  doctor_name: string;
  brick_name: string;
  specialty: string;
  delegate_name: string;
  visit_frequency: string;
  last_visit_date: string | null;
  next_planned_visit: string;
  visits_this_month: number;
  return_index: number;
  status: 'completed' | 'pending' | 'overdue';
}

const SupervisorTeamReturnIndex: React.FC<SupervisorTeamReturnIndexProps> = ({ 
  onBack, 
  delegateIds 
}) => {
  const { profile } = useAuth();
  const [selectedDelegate, setSelectedDelegate] = useState<string>('all');

  // Fetch delegate names
  const { data: delegates = [], isLoading: delegatesLoading } = useQuery({
    queryKey: ['delegates-for-return-index', delegateIds],
    queryFn: async () => {
      if (delegateIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', delegateIds);

      if (error) throw error;
      return data || [];
    },
    enabled: delegateIds.length > 0,
  });

  // Fetch visit plans data
  const { data: visitPlansData = [], isLoading: visitPlansLoading } = useQuery({
    queryKey: ['team-visit-plans-data', delegateIds, selectedDelegate],
    queryFn: async () => {
      if (delegateIds.length === 0) return [];

      const effectiveDelegateIds = selectedDelegate === 'all' 
        ? delegateIds 
        : [selectedDelegate];

      // First fetch visit plans
      const { data: visitPlans, error: visitPlansError } = await supabase
        .from('visit_plans')
        .select('id, visit_frequency, delegate_id, doctor_id')
        .in('delegate_id', effectiveDelegateIds);

      if (visitPlansError) throw visitPlansError;

      if (!visitPlans || visitPlans.length === 0) return [];

      // Get unique doctor IDs
      const doctorIds = [...new Set(visitPlans.map(vp => vp.doctor_id).filter(Boolean))];
      
      // Fetch doctors with bricks
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          id,
          first_name,
          last_name,
          specialty,
          brick_id,
          bricks!doctors_brick_id_fkey(
            id,
            name
          )
        `)
        .in('id', doctorIds);

      if (doctorsError) throw doctorsError;

      // Get delegate names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', effectiveDelegateIds);

      if (profilesError) throw profilesError;

      // Get visits for this month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;

      const visitPlanIds = visitPlans.map(vp => vp.id);
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('id, visit_plan_id, visit_date')
        .in('visit_plan_id', visitPlanIds)
        .gte('visit_date', startDate)
        .lte('visit_date', endDate);

      if (visitsError) throw visitsError;

      // Process data
      const processed: VisitPlanData[] = [];

      for (const plan of visitPlans) {
        const doctor = doctors?.find(d => d.id === plan.doctor_id);
        const delegate = profiles?.find(p => p.id === plan.delegate_id);
        
        if (!doctor || !delegate) continue;

        const planVisits = visits?.filter(v => v.visit_plan_id === plan.id) || [];
        const frequency = parseInt(plan.visit_frequency);
        const requiredVisits = frequency;
        const actualVisits = planVisits.length;
        
        // Calculate return index (simplified)
        const returnIndex = requiredVisits > 0 ? Math.round((actualVisits / requiredVisits) * 100) : 0;
        
        // Determine status
        let status: 'completed' | 'pending' | 'overdue' = 'pending';
        if (actualVisits >= requiredVisits) {
          status = 'completed';
        } else if (currentDate.getDate() > 20) { // Consider overdue after 20th of month
          status = 'overdue';
        }

        // Get last visit date
        const lastVisit = planVisits
          .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0];

        processed.push({
          id: plan.id,
          doctor_name: `${doctor.first_name} ${doctor.last_name}`,
          brick_name: doctor.bricks?.name || 'N/A',
          specialty: doctor.specialty || 'N/A',
          delegate_name: `${delegate.first_name} ${delegate.last_name}`,
          visit_frequency: plan.visit_frequency,
          last_visit_date: lastVisit?.visit_date || null,
          next_planned_visit: 'TBD', // This would need more complex logic
          visits_this_month: actualVisits,
          return_index: returnIndex,
          status
        });
      }

      return processed;
    },
    enabled: delegateIds.length > 0,
  });

  // Filter data by selected delegate
  const filteredData = visitPlansData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getReturnIndexColor = (index: number) => {
    if (index >= 66) return 'text-green-600 bg-green-100';
    if (index >= 33) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const isLoading = delegatesLoading || visitPlansLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team return index data...</p>
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
                  <h1 className="text-2xl font-bold text-gray-900">Team Return Index Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Visit effectiveness analysis for your supervised team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delegate</label>
                <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Delegates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Delegates</SelectItem>
                    {delegates.map((delegate) => (
                      <SelectItem key={delegate.id} value={delegate.id}>
                        {delegate.first_name} {delegate.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredData.length} visit plans
            </div>
          </CardContent>
        </Card>

        {/* Visit Plans Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Team Visit Plans Analysis</CardTitle>
            <p className="text-sm text-gray-500">
              Return index and visit effectiveness for {delegates.length} team members
            </p>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Plans Found</h3>
                <p className="text-gray-600">
                  No visit plans found for the selected criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Brick</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Delegate</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Frequency</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Last Visit</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Visits This Month</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Return Index</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((plan) => (
                      <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">
                          {plan.doctor_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.brick_name}
                        </td>
                        <td className="py-4 px-4">
                          {plan.specialty}
                        </td>
                        <td className="py-4 px-4">
                          {plan.delegate_name}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {plan.visit_frequency}x/month
                        </td>
                        <td className="py-4 px-4 text-center">
                          {plan.last_visit_date 
                            ? new Date(plan.last_visit_date).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="py-4 px-4 text-center">
                          {plan.visits_this_month}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnIndexColor(plan.return_index)}`}>
                            {plan.return_index}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                            {plan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded-full"></div>
                <span>Completed: All required visits done</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 rounded-full"></div>
                <span>Pending: Visits still needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 rounded-full"></div>
                <span>Overdue: Behind schedule</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorTeamReturnIndex;
