
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

interface RapportMedecinsProps {
  onBack: () => void;
}

const RapportMedecins = ({ onBack }: RapportMedecinsProps) => {
  const [selectedMonth, setSelectedMonth] = useState('janvier');

  const rapportData = [
    {
      id: 1,
      nom: "Dr. Martin Dubois",
      visites: {
        janvier: 12,
        fevrier: 15,
        mars: 8,
        avril: 18,
        mai: 14,
        juin: 11
      },
      status: "excellent"
    },
    {
      id: 2,
      nom: "Dr. Sophie Laurent",
      visites: {
        janvier: 18,
        fevrier: 20,
        mars: 16,
        avril: 22,
        mai: 19,
        juin: 17
      },
      status: "excellent"
    },
    {
      id: 3,
      nom: "Dr. Pierre Moreau",
      visites: {
        janvier: 8,
        fevrier: 10,
        mars: 6,
        avril: 12,
        mai: 9,
        juin: 7
      },
      status: "moyen"
    },
    {
      id: 4,
      nom: "Dr. Marie Leroy",
      visites: {
        janvier: 4,
        fevrier: 6,
        mars: 3,
        avril: 5,
        mai: 4,
        juin: 3
      },
      status: "faible"
    },
    {
      id: 5,
      nom: "Dr. Jean Dupont",
      visites: {
        janvier: 10,
        fevrier: 12,
        mars: 9,
        avril: 14,
        mai: 11,
        juin: 10
      },
      status: "moyen"
    },
    {
      id: 6,
      nom: "Dr. Anne Rousseau",
      visites: {
        janvier: 16,
        fevrier: 18,
        mars: 15,
        avril: 20,
        mai: 17,
        juin: 16
      },
      status: "excellent"
    },
    {
      id: 7,
      nom: "Dr. Paul Bernard",
      visites: {
        janvier: 3,
        fevrier: 4,
        mars: 2,
        avril: 5,
        mai: 3,
        juin: 2
      },
      status: "faible"
    },
    {
      id: 8,
      nom: "Dr. Claire Petit",
      visites: {
        janvier: 20,
        fevrier: 22,
        mars: 19,
        avril: 25,
        mai: 21,
        juin: 20
      },
      status: "excellent"
    },
    {
      id: 9,
      nom: "Dr. Marc Fournier",
      visites: {
        janvier: 11,
        fevrier: 13,
        mars: 10,
        avril: 15,
        mai: 12,
        juin: 11
      },
      status: "moyen"
    },
    {
      id: 10,
      nom: "Dr. Julie Martinez",
      visites: {
        janvier: 2,
        fevrier: 3,
        mars: 1,
        avril: 4,
        mai: 2,
        juin: 2
      },
      status: "faible"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 border-green-300';
      case 'moyen':
        return 'bg-yellow-100 border-yellow-300';
      case 'faible':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-800';
      case 'moyen':
        return 'text-yellow-800';
      case 'faible':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const months = [
    { value: 'janvier', label: 'Janvier' },
    { value: 'fevrier', label: 'Février' },
    { value: 'mars', label: 'Mars' },
    { value: 'avril', label: 'Avril' },
    { value: 'mai', label: 'Mai' },
    { value: 'juin', label: 'Juin' }
  ];

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
                <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rapport des Visites</h1>
                  <p className="text-sm text-gray-600">Nombre de visites par médecin et par mois</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sélectionner le mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Rapport Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">
              Rapport des visites - {months.find(m => m.value === selectedMonth)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Médecin</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Janvier</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Février</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Mars</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Avril</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Mai</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Juin</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rapportData.map((medecin) => {
                    const total = Object.values(medecin.visites).reduce((sum, visites) => sum + visites, 0);
                    return (
                      <tr key={medecin.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getStatusColor(medecin.status)} border-2`}>
                        <td className="py-4 px-4">
                          <span className={`font-medium ${getStatusTextColor(medecin.status)}`}>
                            {medecin.nom}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <span className={`px-2 py-1 rounded ${selectedMonth === 'janvier' ? 'bg-blue-200 font-bold' : ''}`}>
                            {medecin.visites.janvier}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <span className={`px-2 py-1 rounded ${selectedMonth === 'fevrier' ? 'bg-blue-200 font-bold' : ''}`}>
                            {medecin.visites.fevrier}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <span className={`px-2 py-1 rounded ${selectedMonth === 'mars' ? 'bg-blue-200 font-bold' : ''}`}>
                            {medecin.visites.mars}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <span className={`px-2 py-1 rounded ${selectedMonth === 'avril' ? 'bg-blue-200 font-bold' : ''}`}>
                            {medecin.visites.avril}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <span className={`px-2 py-1 rounded ${selectedMonth === 'mai' ? 'bg-blue-200 font-bold' : ''}`}>
                            {medecin.visites.mai}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center ${getStatusTextColor(medecin.status)}`}>
                          <span className={`px-2 py-1 rounded ${selectedMonth === 'juin' ? 'bg-blue-200 font-bold' : ''}`}>
                            {medecin.visites.juin}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-center font-bold ${getStatusTextColor(medecin.status)}`}>
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Légende */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                <span className="text-sm text-green-800 font-medium">Excellent (80%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-300 rounded"></div>
                <span className="text-sm text-yellow-800 font-medium">Moyen (50-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
                <span className="text-sm text-red-800 font-medium">Faible (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RapportMedecins;
