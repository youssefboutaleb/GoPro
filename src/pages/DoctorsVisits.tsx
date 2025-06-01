
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DoctorWithBrick } from '@/types/doctor';
import { VisitWithJoins } from '@/types/visit';

interface DoctorVisitStats {
  doctor: DoctorWithBrick;
  visitedThisMonth: boolean;
  visitedLastMonth: boolean;
  visitsThisMonth: number;
  visitsLastMonth: number;
}

const DoctorsVisits = () => {
  const [doctors, setDoctors] = useState<DoctorVisitStats[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [visitIndex, setVisitIndex] = useState(0);

  useEffect(() => {
    fetchDoctorsWithVisits();
  }, [selectedMonth, selectedYear]);

  const fetchDoctorsWithVisits = async () => {
    setLoading(true);
    try {
      // Fetch all active doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          *,
          bricks (
            name,
            region
          )
        `)
        .eq('active', true)
        .order('last_name', { ascending: true });

      if (doctorsError) throw doctorsError;

      // Fetch visits for current and last month
      const currentMonth = selectedMonth;
      const currentYear = selectedYear;
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .in('status', ['planifiee', 'realisee'])
        .gte('visit_date', `${Math.min(lastMonthYear, currentYear)}-${Math.min(lastMonth, currentMonth).toString().padStart(2, '0')}-01`)
        .lt('visit_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      if (visitsError) throw visitsError;

      // Process data
      const doctorStats: DoctorVisitStats[] = (doctorsData || []).map(doctor => {
        const doctorVisits = visitsData?.filter(visit => visit.doctor_id === doctor.id) || [];
        
        const thisMonthVisits = doctorVisits.filter(visit => {
          const visitDate = new Date(visit.visit_date);
          return visitDate.getMonth() + 1 === currentMonth && visitDate.getFullYear() === currentYear;
        });

        const lastMonthVisits = doctorVisits.filter(visit => {
          const visitDate = new Date(visit.visit_date);
          return visitDate.getMonth() + 1 === lastMonth && visitDate.getFullYear() === lastMonthYear;
        });

        return {
          doctor,
          visitedThisMonth: thisMonthVisits.length > 0,
          visitedLastMonth: lastMonthVisits.length > 0,
          visitsThisMonth: thisMonthVisits.length,
          visitsLastMonth: lastMonthVisits.length
        };
      });

      setDoctors(doctorStats);

      // Calculate visit index (percentage of visits done vs possible visits)
      const totalPossibleVisits = doctorStats.length * 2; // 2 visits per doctor per month
      const totalActualVisits = doctorStats.reduce((sum, stat) => sum + Math.min(stat.visitsThisMonth, 2), 0);
      setVisitIndex(totalPossibleVisits > 0 ? Math.round((totalActualVisits / totalPossibleVisits) * 100) : 0);

    } catch (error) {
      console.error('Error fetching doctors and visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRowHighlight = (stat: DoctorVisitStats) => {
    if (stat.visitedThisMonth && stat.visitedLastMonth) {
      return 'bg-green-50 hover:bg-green-100';
    } else if (stat.visitedThisMonth && !stat.visitedLastMonth) {
      return 'bg-yellow-50 hover:bg-yellow-100';
    } else if (!stat.visitedThisMonth && !stat.visitedLastMonth) {
      return 'bg-red-50 hover:bg-red-100';
    }
    return '';
  };

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Suivi des visites médecins</CardTitle>
          <CardDescription>
            Vue d'ensemble des visites par médecin avec indicateur de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Mois</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Année</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold">
                Indice de visite global: {visitIndex}%
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${visitIndex}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Visité ce mois et le mois dernier</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Visité ce mois seulement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Non visité ces deux derniers mois</span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médecin</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Brick</TableHead>
                <TableHead>Visites ce mois</TableHead>
                <TableHead>Visites mois dernier</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((stat) => (
                <TableRow key={stat.doctor.id} className={getRowHighlight(stat)}>
                  <TableCell className="font-medium">
                    Dr {stat.doctor.first_name} {stat.doctor.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{stat.doctor.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    {stat.doctor.bricks ? stat.doctor.bricks.name : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stat.visitsThisMonth >= 2 ? "default" : stat.visitsThisMonth === 1 ? "secondary" : "destructive"}>
                      {stat.visitsThisMonth}/2
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stat.visitsLastMonth >= 2 ? "default" : stat.visitsLastMonth === 1 ? "secondary" : "outline"}>
                      {stat.visitsLastMonth}/2
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {stat.visitedThisMonth && stat.visitedLastMonth && (
                      <Badge className="bg-green-100 text-green-800">Régulier</Badge>
                    )}
                    {stat.visitedThisMonth && !stat.visitedLastMonth && (
                      <Badge className="bg-yellow-100 text-yellow-800">Récent</Badge>
                    )}
                    {!stat.visitedThisMonth && !stat.visitedLastMonth && (
                      <Badge className="bg-red-100 text-red-800">À risque</Badge>
                    )}
                    {!stat.visitedThisMonth && stat.visitedLastMonth && (
                      <Badge variant="outline">En pause</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorsVisits;
