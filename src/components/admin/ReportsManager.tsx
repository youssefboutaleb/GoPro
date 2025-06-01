
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ReportsManagerProps {
  onBack: () => void;
}

interface VisitReport {
  id: string;
  visit_date: string;
  doctor_name: string;
  doctor_specialty: string;
  status: string;
  representative: string;
  notes: string;
}

interface BrickReport {
  id: string;
  name: string;
  region: string;
  doctor_count: number;
  visit_count: number;
}

const ReportsManager: React.FC<ReportsManagerProps> = ({ onBack }) => {
  const [reportType, setReportType] = useState<'visits' | 'bricks'>('visits');
  const [visitReports, setVisitReports] = useState<VisitReport[]>([]);
  const [brickReports, setBrickReports] = useState<BrickReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType === 'visits') {
      generateVisitReport();
    } else {
      generateBrickReport();
    }
  }, [reportType]);

  const generateVisitReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_date,
          status,
          notes,
          doctors (
            first_name,
            last_name,
            specialty
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;

      const formattedData: VisitReport[] = data.map(visit => ({
        id: visit.id,
        visit_date: visit.visit_date,
        doctor_name: visit.doctors 
          ? `${visit.doctors.first_name} ${visit.doctors.last_name}`
          : 'N/A',
        doctor_specialty: visit.doctors?.specialty || 'N/A',
        status: visit.status || 'planifiee',
        representative: visit.profiles
          ? `${visit.profiles.first_name} ${visit.profiles.last_name}`
          : 'N/A',
        notes: visit.notes || '',
      }));

      setVisitReports(formattedData);
    } catch (error) {
      console.error('Error generating visit report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport des visites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBrickReport = async () => {
    setLoading(true);
    try {
      // Get bricks with doctor and visit counts
      const { data: bricksData, error: bricksError } = await supabase
        .from('bricks')
        .select(`
          id,
          name,
          region,
          doctors (
            id,
            visits (
              id
            )
          )
        `);

      if (bricksError) throw bricksError;

      const formattedData: BrickReport[] = bricksData.map(brick => {
        const doctorCount = brick.doctors?.length || 0;
        const visitCount = brick.doctors?.reduce((total, doctor) => {
          return total + (doctor.visits?.length || 0);
        }, 0) || 0;

        return {
          id: brick.id,
          name: brick.name,
          region: brick.region,
          doctor_count: doctorCount,
          visit_count: visitCount,
        };
      });

      setBrickReports(formattedData);
    } catch (error) {
      console.error('Error generating brick report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport des bricks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Attention",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Succès",
      description: "Rapport exporté avec succès",
    });
  };

  const statusLabels = {
    'planifiee': 'Planifiée',
    'realisee': 'Réalisée',
    'annulee': 'Annulée',
  };

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Génération de Rapports</CardTitle>
                <CardDescription>Générer et exporter des rapports</CardDescription>
              </div>
              <div className="flex space-x-4">
                <Select value={reportType} onValueChange={(value: 'visits' | 'bricks') => setReportType(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Type de rapport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visits">Rapport des Visites</SelectItem>
                    <SelectItem value="bricks">Rapport des Bricks</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (reportType === 'visits') {
                      exportToCSV(visitReports, 'rapport_visites');
                    } else {
                      exportToCSV(brickReports, 'rapport_bricks');
                    }
                  }}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Exporter CSV</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Génération du rapport...</div>
            ) : reportType === 'visits' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Représentant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitReports.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        {new Date(visit.visit_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-medium">Dr {visit.doctor_name}</TableCell>
                      <TableCell>{visit.doctor_specialty}</TableCell>
                      <TableCell>{visit.representative}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          visit.status === 'realisee' 
                            ? 'bg-green-100 text-green-800'
                            : visit.status === 'annulee'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {statusLabels[visit.status as keyof typeof statusLabels] || visit.status}
                        </span>
                      </TableCell>
                      <TableCell>{visit.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brick</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Nombre de Médecins</TableHead>
                    <TableHead>Nombre de Visites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brickReports.map((brick) => (
                    <TableRow key={brick.id}>
                      <TableCell className="font-medium">{brick.name}</TableCell>
                      <TableCell>{brick.region}</TableCell>
                      <TableCell>{brick.doctor_count}</TableCell>
                      <TableCell>{brick.visit_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {((reportType === 'visits' && visitReports.length === 0) || 
              (reportType === 'bricks' && brickReports.length === 0)) && !loading && (
              <div className="text-center py-8 text-gray-500">
                Aucune donnée disponible pour ce rapport
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsManager;
