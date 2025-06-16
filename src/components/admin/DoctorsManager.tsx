
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, User, Stethoscope, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DoctorDialog from './DoctorDialog';

interface DoctorsManagerProps {
  onBack: () => void;
}

interface Doctor {
  id: string;
  name: string;
  first_name: string;
  specialty: string | null;
  territory_id: string | null;
  territories?: {
    name: string;
    sectors?: {
      name: string;
    };
  };
}

const DoctorsManager: React.FC<DoctorsManagerProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const queryClient = useQueryClient();

  const { data: doctors = [], isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      console.log('Fetching doctors from Supabase...');
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          first_name,
          specialty,
          territory_id,
          territories:territory_id (
            name,
            sectors:sector_id (
              name
            )
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }

      console.log('Fetched doctors:', data);
      console.log('Number of doctors fetched:', data?.length || 0);
      return data as Doctor[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting doctor:', error);
      toast.error('Error deleting doctor');
    }
  });

  // Log data for debugging
  console.log('Current doctors state:', doctors);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.first_name} ${doctor.name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesTerritory = selectedTerritory === 'all' || doctor.territories?.name === selectedTerritory;
    return matchesSearch && matchesSpecialty && matchesTerritory;
  });

  // Get unique specialties and territories for filters
  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
  const territories = [...new Set(doctors.map(d => d.territories?.name).filter(Boolean))];

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDialogOpen(true);
  };

  const handleDelete = (doctorId: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      deleteMutation.mutate(doctorId);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingDoctor(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading doctors: {error.message}</p>
          <Button onClick={onBack}>Back</Button>
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
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Doctors List</h1>
                  <p className="text-sm text-gray-600">{filteredDoctors.length} doctors found out of {doctors.length} total</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add doctor</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Specialty</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty!}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Territory</label>
                <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All territories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All territories</SelectItem>
                    {territories.map(territory => (
                      <SelectItem key={territory} value={territory!}>{territory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {doctors.length === 0 && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Debug: No data found in the 'doctors' table. 
                Check that data exists in Supabase.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <span>Doctors List</span>
            </CardTitle>
            <CardDescription>
              Doctors database management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {doctors.length === 0 ? 'No data in database' : 'No doctors found'}
                </h3>
                <p className="text-gray-600">
                  {doctors.length === 0 
                    ? 'The doctors table seems to be empty. Add doctors in Supabase.'
                    : 'Try modifying your search criteria.'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.first_name}</TableCell>
                      <TableCell>{doctor.specialty || 'Not specified'}</TableCell>
                      <TableCell>{doctor.territories?.name || 'Not assigned'}</TableCell>
                      <TableCell>{doctor.territories?.sectors?.name || 'Not assigned'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(doctor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(doctor.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <DoctorDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        doctor={editingDoctor}
      />
    </div>
  );
};

export default DoctorsManager;
