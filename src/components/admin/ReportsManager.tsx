
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ReportsManagerProps {
  onBack: () => void;
}

interface IndiceData {
  globalIndex: number;
  quarterlyData: Array<{
    quarter: string;
    indice: number;
  }>;
  monthlyData: Array<{
    month: string;
    indice: number;
  }>;
}

const ReportsManager: React.FC<ReportsManagerProps> = ({ onBack }) => {
  const [indiceData, setIndiceData] = useState<IndiceData>({
    globalIndex: 0,
    quarterlyData: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartConfig = {
    indice: {
      label: "Indice de retour",
      color: "#8b5cf6",
    },
  };

  useEffect(() => {
    const fetchIndiceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current year data
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        // Fetch all visits and delegue_medecins data for the current year
        const { data: visitesData, error: visitesError } = await supabase
          .from('visites')
          .select('delegue_id, medecin_id, date_visite')
          .gte('date_visite', startOfYear)
          .lte('date_visite', endOfYear);

        if (visitesError) {
          console.error('Error fetching visites:', visitesError);
          setError('Erreur lors de la récupération des visites');
          return;
        }

        const { data: delegueMedecinsData, error: dmError } = await supabase
          .from('delegue_medecins')
          .select('delegue_id, medecin_id, frequence_visite');

        if (dmError) {
          console.error('Error fetching delegue_medecins:', dmError);
          setError('Erreur lors de la récupération des données');
          return;
        }

        // Process data by month and quarter
        const monthlyStats: { [key: string]: { effectuees: number; attendues: number } } = {};
        const quarterlyStats: { [key: string]: { effectuees: number; attendues: number } } = {};

        // Initialize months and quarters
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
          monthlyStats[monthKey] = { effectuees: 0, attendues: 0 };
        }

        for (let quarter = 1; quarter <= 4; quarter++) {
          const quarterKey = `Q${quarter} ${currentYear}`;
          quarterlyStats[quarterKey] = { effectuees: 0, attendues: 0 };
        }

        // Calculate expected visits per month for each delegue-medecin pair
        delegueMedecinsData?.forEach(dm => {
          const frequence = parseInt(dm.frequence_visite || '1');
          
          for (let month = 1; month <= 12; month++) {
            const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
            monthlyStats[monthKey].attendues += frequence;

            // Add to quarterly stats
            const quarter = Math.ceil(month / 3);
            const quarterKey = `Q${quarter} ${currentYear}`;
            quarterlyStats[quarterKey].attendues += frequence;
          }
        });

        // Count actual visits
        visitesData?.forEach(visite => {
          const visitDate = new Date(visite.date_visite);
          const month = visitDate.getMonth() + 1;
          const quarter = Math.ceil(month / 3);
          
          const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
          const quarterKey = `Q${quarter} ${currentYear}`;

          if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].effectuees++;
          }
          if (quarterlyStats[quarterKey]) {
            quarterlyStats[quarterKey].effectuees++;
          }
        });

        // Calculate monthly data
        const monthNames = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        const monthlyData = Object.entries(monthlyStats).map(([monthKey, stats]) => {
          const month = parseInt(monthKey.split('-')[1]);
          const indice = stats.attendues > 0 ? Math.round((stats.effectuees / stats.attendues) * 100) : 0;
          return {
            month: monthNames[month - 1],
            indice
          };
        });

        // Calculate quarterly data
        const quarterlyData = Object.entries(quarterlyStats).map(([quarterKey, stats]) => {
          const indice = stats.attendues > 0 ? Math.round((stats.effectuees / stats.attendues) * 100) : 0;
          return {
            quarter: quarterKey,
            indice
          };
        });

        // Calculate global index
        const totalEffectuees = Object.values(monthlyStats).reduce((sum, stats) => sum + stats.effectuees, 0);
        const totalAttendues = Object.values(monthlyStats).reduce((sum, stats) => sum + stats.attendues, 0);
        const globalIndex = totalAttendues > 0 ? Math.round((totalEffectuees / totalAttendues) * 100) : 0;

        setIndiceData({
          globalIndex,
          quarterlyData,
          monthlyData
        });

      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Une erreur inattendue s\'est produite');
      } finally {
        setLoading(false);
      }
    };

    fetchIndiceData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
                  <p className="text-sm text-gray-600">Indice de retour détaillé</p>
                </div>
              </div>
            </div>
            
            {/* Global Index */}
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 border-0 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-90">Indice Global</p>
                    <p className="text-2xl font-bold">{indiceData.globalIndex}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Quarterly Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Indice de retour par trimestre</span>
            </CardTitle>
            <CardDescription>Performance trimestrielle pour l'année en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indiceData.quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="indice" fill="var(--color-indice)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Indice de retour par mois</span>
            </CardTitle>
            <CardDescription>Performance mensuelle pour l'année en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indiceData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="indice" 
                    stroke="var(--color-indice)" 
                    strokeWidth={3}
                    dot={{ fill: "var(--color-indice)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsManager;
