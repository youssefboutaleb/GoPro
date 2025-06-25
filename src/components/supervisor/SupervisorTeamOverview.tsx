
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, Calendar } from 'lucide-react';

interface SupervisorTeamOverviewProps {
  delegateIds: string[];
  selectedMonth: number;
  supervisedDelegates: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
}

const SupervisorTeamOverview: React.FC<SupervisorTeamOverviewProps> = ({
  delegateIds,
  selectedMonth,
  supervisedDelegates
}) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <span>Team Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Team Size</p>
                <p className="text-2xl font-bold text-blue-900">{supervisedDelegates.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Period</p>
                <p className="text-2xl font-bold text-green-900">{monthNames[selectedMonth - 1]}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">YTD Months</p>
                <p className="text-2xl font-bold text-purple-900">{selectedMonth}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Analysis Ready</p>
                <p className="text-2xl font-bold text-orange-900">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Active
                  </Badge>
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
          <div className="flex flex-wrap gap-2">
            {supervisedDelegates.map((delegate) => (
              <Badge key={delegate.id} variant="outline" className="px-3 py-1">
                {delegate.first_name} {delegate.last_name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupervisorTeamOverview;
