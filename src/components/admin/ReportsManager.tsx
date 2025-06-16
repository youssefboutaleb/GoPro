
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportsManagerProps {
  onBack: () => void;
}

const ReportsManager: React.FC<ReportsManagerProps> = ({ onBack }) => {
  const [selectedDelegate, setSelectedDelegate] = useState<string>('all');

  // Fetch delegates for the dropdown (profiles with role 'Delegate')
  const { data: delegates = [] } = useQuery({
    queryKey: ['delegates_for_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'Delegate')
        .order('id');

      if (error) throw error;
      return data;
    }
  });

  // Fetch visits data
  const { data: visitsData = [] } = useQuery({
    queryKey: ['visits_data', selectedDelegate],
    queryFn: async () => {
      let query = supabase
        .from('visits')
        .select(`
          *,
          visit_plans:visit_plan_id(
            delegate_id,
            doctor_id,
            visit_frequency,
            doctors:doctor_id(first_name, last_name)
          )
        `)
        .gte('visit_date', '2024-01-01');

      if (selectedDelegate !== 'all') {
        // We need to filter by delegate through the visit_plans relation
        const { data: planIds } = await supabase
          .from('visit_plans')
          .select('id')
          .eq('delegate_id', selectedDelegate);
        
        if (planIds && planIds.length > 0) {
          const ids = planIds.map(obj => obj.id);
          query = query.in('visit_plan_id', ids);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch visit_plans data for indice calculation
  const { data: visitPlansData = [] } = useQuery({
    queryKey: ['visit_plans_data', selectedDelegate],
    queryFn: async () => {
      let query = supabase
        .from('visit_plans')
        .select(`
          *,
          doctors:doctor_id(first_name, last_name)
        `);

      if (selectedDelegate !== 'all') {
        query = query.eq('delegate_id', selectedDelegate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate Indice de Retour
  const calculateIndiceRetour = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // n = number of visits done by selected delegate to his associated doctors in current year
    const visitsThisYear = visitsData.filter(visit => {
      const visitYear = new Date(visit.visit_date).getFullYear();
      return visitYear === currentYear;
    });
    const n = visitsThisYear.length;
    
    // f = sum of (visit_frequency * number of current month) for all corresponding doctors
    const f = visitPlansData.reduce((sum, plan) => {
      const frequencyValue = parseInt(plan.visit_frequency) || 1;
      return sum + (frequencyValue * currentMonth);
    }, 0);
    
    const indice = f > 0 ? (n / f) * 100 : 0;
    return { indice: Math.round(indice), n, f };
  };

  const { indice, n, f } = calculateIndiceRetour();

  // Process data for quarterly chart
  const quarterlyData = [
    { quarter: 'Q1 2024', visites: visitsData.filter(v => {
      const month = new Date(v.visit_date).getMonth() + 1;
      return month >= 1 && month <= 3;
    }).length },
    { quarter: 'Q2 2024', visites: visitsData.filter(v => {
      const month = new Date(v.visit_date).getMonth() + 1;
      return month >= 4 && month <= 6;
    }).length },
    { quarter: 'Q3 2024', visites: visitsData.filter(v => {
      const month = new Date(v.visit_date).getMonth() + 1;
      return month >= 7 && month <= 9;
    }).length },
    { quarter: 'Q4 2024', visites: visitsData.filter(v => {
      const month = new Date(v.visit_date).getMonth() + 1;
      return month >= 10 && month <= 12;
    }).length },
  ];

  // Process data for monthly chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthName = new Date(2024, i, 1).toLocaleDateString('fr-FR', { month: 'short' });
    const visites = visitsData.filter(v => {
      const visitMonth = new Date(v.visit_date).getMonth() + 1;
      return visitMonth === month;
    }).length;
    
    return { month: monthName, visites };
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Rapports et Analyses</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Délégué</label>
                <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un délégué" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les délégués</SelectItem>
                    {delegates.map((delegate) => (
                      <SelectItem key={delegate.id} value={delegate.id}>
                        Délégué {delegate.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Indice de Retour Display */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg min-w-[200px]">
                <div className="text-center">
                  <div className="text-2xl font-bold">{indice}%</div>
                  <div className="text-sm opacity-90">Indice de Retour</div>
                  <div className="text-xs opacity-75 mt-1">({n}/{f})</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quarterly Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Visites par Trimestre</CardTitle>
              </div>
              <CardDescription>Évolution trimestrielle des visites</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visites" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle>Visites par Mois</CardTitle>
              </div>
              <CardDescription>Évolution mensuelle des visites</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visites" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visites</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Cette année
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Médecins Ciblés</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitPlansData.length}</div>
              <p className="text-xs text-muted-foreground">
                Objectifs de visite
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne/Mois</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {visitsData.length > 0 ? Math.round(visitsData.length / 12) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Visites par mois
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
