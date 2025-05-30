
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, TrendingUp, Calendar, MapPin } from 'lucide-react';
import IndiceRetour from '@/components/IndiceRetour';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  if (activeTab === 'indice-retour') {
    return <IndiceRetour onBack={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GOPRO</h1>
                <p className="text-sm text-gray-600">Goal Performance Reporting Outil</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Semaine 1</span>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Région Nord</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Card - Indice de Retour */}
        <div className="flex justify-center">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 w-full max-w-md"
                onClick={() => setActiveTab('indice-retour')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <RotateCcw className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Indice de Retour</CardTitle>
                  <CardDescription className="text-purple-100">
                    Analyse des médecins par spécialité et brick
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Total médecins</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">342</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Par spécialité</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">3</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Par brick</span>
                  <div className="bg-white/20 text-white px-2 py-1 rounded text-sm">4</div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                Consulter l'indice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
