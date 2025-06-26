
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, Filter } from 'lucide-react';
import BreadcrumbNavigation from './common/BreadcrumbNavigation';
import InteractiveVisitTable from './InteractiveVisitTable';
import ReturnIndexAnalysis from './ReturnIndexAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VisitPlansManagementProps {
  onBack: () => void;
  delegateIds?: string[];
  supervisorName?: string;
}

const VisitPlansManagement: React.FC<VisitPlansManagementProps> = ({ 
  onBack, 
  delegateIds = [], 
  supervisorName 
}) => {
  const { profile } = useAuth();
  const [selectedBrick, setSelectedBrick] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDelegate, setSelectedDelegate] = useState<string>('all');
  const [showReturnIndexAnalysis, setShowReturnIndexAnalysis] = useState(false);

  // Use provided delegateIds or fallback to current user
  const effectiveDelegateIds = delegateIds.length > 0 ? delegateIds : [profile?.id].filter(Boolean);

  // Fetch delegates for filter
  const { data: delegates = [] } = useQuery({
    queryKey: ['delegates-for-filter', effectiveDelegateIds.join(',')],
    queryFn: async () => {
      if (effectiveDelegateIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', effectiveDelegateIds)
        .eq('role', 'Delegate');

      if (error) throw error;
      return data || [];
    },
    enabled: effectiveDelegateIds.length > 0,
  });

  // Fetch bricks for filter
  const { data: bricks = [] } = useQuery({
    queryKey: ['bricks-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch doctor specialties for filter
  const { data: specialties = [] } = useQuery({
    queryKey: ['doctor-specialties-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('specialty')
        .not('specialty', 'is', null);

      if (error) throw error;
      
      // Get unique specialties
      const uniqueSpecialties = [...new Set(data?.map(d => d.specialty).filter(Boolean))];
      return uniqueSpecialties || [];
    },
  });

  const breadcrumbItems = [
    { label: 'Visit Plans Management' }
  ];

  const handleClearFilters = () => {
    setSelectedBrick('all');
    setSelectedSpecialty('all');
    setSelectedDelegate('all');
  };

  // Calculate filtered delegate IDs for the table
  const filteredDelegateIds = selectedDelegate === 'all' 
    ? effectiveDelegateIds 
    : [selectedDelegate];

  // Show Return Index Analysis interface
  if (showReturnIndexAnalysis) {
    return <ReturnIndexAnalysis 
      onBack={() => setShowReturnIndexAnalysis(false)} 
      delegateIds={filteredDelegateIds}
      supervisorName={supervisorName}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="p-2 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Visit Plans Management</h1>
                  <p className="text-sm text-gray-600">
                    {supervisorName 
                      ? `Manage and track visit plans for ${supervisorName}'s team`
                      : 'Manage and track your visit plans'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <BreadcrumbNavigation 
          items={breadcrumbItems}
          onBack={onBack}
          showHomeIcon={true}
        />

        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brick</label>
                <Select value={selectedBrick} onValueChange={setSelectedBrick}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Bricks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bricks</SelectItem>
                    {bricks.map((brick) => (
                      <SelectItem key={brick.id} value={brick.name}>
                        {brick.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Filter visits by delegate, brick location and doctor specialty
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowReturnIndexAnalysis(true)}
                >
                  Return Index Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Interactive Visit Plans</CardTitle>
            <p className="text-sm text-gray-600">
              {supervisorName 
                ? `Track team visits, record new visits by swiping right, and monitor team return index`
                : 'Track your visits, record new visits by swiping right, and monitor your return index'
              }
            </p>
          </CardHeader>
          <CardContent>
            <InteractiveVisitTable 
              delegateIds={filteredDelegateIds} 
              brickFilter={selectedBrick}
              specialtyFilter={selectedSpecialty}
              showDelegateGrouping={filteredDelegateIds.length > 1}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitPlansManagement;
