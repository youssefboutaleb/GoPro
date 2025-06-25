
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User } from 'lucide-react';

interface SalesDirectorTeamStructureProps {
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
}

const SalesDirectorTeamStructure: React.FC<SalesDirectorTeamStructureProps> = ({
  supervisedSupervisors,
  allDelegates
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <span>Team Structure</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {supervisedSupervisors.map((supervisor) => {
            const supervisorDelegates = allDelegates.filter(d => d.supervisor_id === supervisor.id);
            
            return (
              <div key={supervisor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {supervisor.first_name} {supervisor.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">Supervisor</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    {supervisorDelegates.length} delegate{supervisorDelegates.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {supervisorDelegates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-8">
                    {supervisorDelegates.map((delegate) => (
                      <div key={delegate.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {delegate.first_name} {delegate.last_name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-8 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 italic">No delegates assigned</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesDirectorTeamStructure;
