
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Target, Calendar } from 'lucide-react';

interface SalesDirectorOverviewProps {
  supervisedSupervisors: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  allDelegates: Array<{
    id: string;
    first_name: string;
    last_name: string;
    supervisor_id: string;
  }>;
  selectedMonth: number;
}

const SalesDirectorOverview: React.FC<SalesDirectorOverviewProps> = ({
  supervisedSupervisors,
  allDelegates,
  selectedMonth
}) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate team distribution
  const teamDistribution = supervisedSupervisors.map(supervisor => {
    const delegateCount = allDelegates.filter(d => d.supervisor_id === supervisor.id).length;
    return {
      supervisor: `${supervisor.first_name} ${supervisor.last_name}`,
      delegates: delegateCount
    };
  });

  const totalDelegates = allDelegates.length;
  const totalSupervisors = supervisedSupervisors.length;
  const avgDelegatesPerSupervisor = totalSupervisors > 0 ? Math.round(totalDelegates / totalSupervisors) : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-purple-600" />
          <span>Organization Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Supervisors</p>
                <p className="text-2xl font-bold text-blue-900">{totalSupervisors}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Delegates</p>
                <p className="text-2xl font-bold text-green-900">{totalDelegates}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Team Size</p>
                <p className="text-2xl font-bold text-purple-900">{avgDelegatesPerSupervisor}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Analysis Period</p>
                <p className="text-2xl font-bold text-orange-900">{monthNames[selectedMonth - 1]}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Team Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamDistribution.map((team, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{team.supervisor}</span>
                <Badge variant="outline" className="bg-white">
                  {team.delegates} delegate{team.delegates !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesDirectorOverview;
