
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import BreadcrumbNavigation from './common/BreadcrumbNavigation';
import InteractiveVisitTable from './InteractiveVisitTable';
import { useAuth } from '@/hooks/useAuth';

interface VisitPlansManagementProps {
  onBack: () => void;
}

const VisitPlansManagement: React.FC<VisitPlansManagementProps> = ({ onBack }) => {
  const { profile } = useAuth();

  const breadcrumbItems = [
    { label: 'Visit Plans Management' }
  ];

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
                    Manage and track your visit plans
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

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Interactive Visit Plans</CardTitle>
            <p className="text-sm text-gray-600">
              Track your visits, record new visits by swiping right, and monitor your return index
            </p>
          </CardHeader>
          <CardContent>
            <InteractiveVisitTable delegateIds={profile?.id ? [profile.id] : []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitPlansManagement;
