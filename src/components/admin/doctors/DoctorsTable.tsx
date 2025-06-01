
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { DoctorWithBrick, Doctor, specialtyLabels } from '@/types/doctor';

interface DoctorsTableProps {
  doctors: DoctorWithBrick[];
  loading: boolean;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

const DoctorsTable: React.FC<DoctorsTableProps> = ({
  doctors,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Spécialité</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Brick</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctors.map((doctor) => (
          <TableRow key={doctor.id}>
            <TableCell className="font-medium">
              Dr {doctor.first_name} {doctor.last_name}
            </TableCell>
            <TableCell>{specialtyLabels[doctor.specialty]}</TableCell>
            <TableCell>{doctor.email}</TableCell>
            <TableCell>{doctor.phone}</TableCell>
            <TableCell>
              {doctor.bricks ? `${doctor.bricks.name} (${doctor.bricks.region})` : '-'}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                doctor.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {doctor.active ? 'Actif' : 'Inactif'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(doctor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(doctor)}
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
  );
};

export default DoctorsTable;
