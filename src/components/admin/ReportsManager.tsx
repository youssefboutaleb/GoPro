
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface ReportsManagerProps {
  onBack: () => void;
}

const ReportsManager: React.FC<ReportsManagerProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Génération de Rapports</CardTitle>
            <CardDescription>Fonctionnalité en cours de développement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Cette fonctionnalité sera disponible prochainement.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsManager;
