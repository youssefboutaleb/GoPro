
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { VisitWithJoins, Visit, statusLabels, statusColors } from '@/types/visit';

interface VisitsTableProps {
  visits: VisitWithJoins[];
  loading: boolean;
  onEdit: (visit: Visit) => void;
  onDelete: (visit: Visit) => void;
}

const VisitsTable: React.FC<VisitsTableProps> = ({
  visits,
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
          <TableHead>Date</TableHead>
          <TableHead>Médecin</TableHead>
          <TableHead>Représentant</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => (
          <TableRow key={visit.id}>
            <TableCell className="font-medium">
              {new Date(visit.visit_date).toLocaleDateString('fr-FR')}
            </TableCell>
            <TableCell>
              {visit.doctors 
                ? `Dr ${visit.doctors.first_name} ${visit.doctors.last_name}` 
                : '-'}
            </TableCell>
            <TableCell>
              {visit.profiles 
                ? `${visit.profiles.first_name} ${visit.profiles.last_name}` 
                : '-'}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                statusColors[visit.status || 'planifiee']
              }`}>
                {statusLabels[visit.status || 'planifiee']}
              </span>
            </TableCell>
            <TableCell>{visit.notes}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(visit)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(visit)}
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

export default VisitsTable;
