
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Stethoscope, Package } from 'lucide-react';

interface TargetedEntitiesProps {
  targetedProducts?: string[];
  targetedBricks?: string[];
  targetedDoctors?: string[];
  targetedDelegates?: string[];
  targetedSupervisors?: string[];
  targetedSalesDirectors?: string[];
}

const TargetedEntities: React.FC<TargetedEntitiesProps> = ({
  targetedProducts = [],
  targetedBricks = [],
  targetedDoctors = [],
  targetedDelegates = [],
  targetedSupervisors = [],
  targetedSalesDirectors = []
}) => {
  const { data: productNames } = useQuery({
    queryKey: ['product-names', targetedProducts],
    queryFn: async () => {
      if (targetedProducts.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .in('id', targetedProducts);
      if (error) throw error;
      return data;
    },
    enabled: targetedProducts.length > 0
  });

  const { data: brickNames } = useQuery({
    queryKey: ['brick-names', targetedBricks],
    queryFn: async () => {
      if (targetedBricks.length === 0) return [];
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name')
        .in('id', targetedBricks);
      if (error) throw error;
      return data;
    },
    enabled: targetedBricks.length > 0
  });

  const { data: doctorNames } = useQuery({
    queryKey: ['doctor-names', targetedDoctors],
    queryFn: async () => {
      if (targetedDoctors.length === 0) return [];
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
        .in('id', targetedDoctors);
      if (error) throw error;
      return data;
    },
    enabled: targetedDoctors.length > 0
  });

  const { data: delegateNames } = useQuery({
    queryKey: ['delegate-names', targetedDelegates],
    queryFn: async () => {
      if (targetedDelegates.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', targetedDelegates);
      if (error) throw error;
      return data;
    },
    enabled: targetedDelegates.length > 0
  });

  const totalPeople = targetedDelegates.length + targetedSupervisors.length + targetedSalesDirectors.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {targetedProducts.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            {targetedProducts.length} Product{targetedProducts.length > 1 ? 's' : ''}
          </Badge>
        )}
        
        {targetedBricks.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {targetedBricks.length} Brick{targetedBricks.length > 1 ? 's' : ''}
          </Badge>
        )}
        
        {targetedDoctors.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Stethoscope className="w-3 h-3 mr-1" />
            {targetedDoctors.length} Doctor{targetedDoctors.length > 1 ? 's' : ''}
          </Badge>
        )}
        
        {totalPeople > 0 && (
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {totalPeople} People
          </Badge>
        )}
      </div>

      {/* Detailed view - show first few names */}
      <div className="text-xs text-gray-600 space-y-1">
        {productNames && productNames.length > 0 && (
          <div>
            <span className="font-medium">Products:</span>{' '}
            {productNames.slice(0, 3).map(p => p.name).join(', ')}
            {productNames.length > 3 && ` +${productNames.length - 3} more`}
          </div>
        )}
        
        {brickNames && brickNames.length > 0 && (
          <div>
            <span className="font-medium">Bricks:</span>{' '}
            {brickNames.slice(0, 3).map(b => b.name).join(', ')}
            {brickNames.length > 3 && ` +${brickNames.length - 3} more`}
          </div>
        )}
        
        {doctorNames && doctorNames.length > 0 && (
          <div>
            <span className="font-medium">Doctors:</span>{' '}
            {doctorNames.slice(0, 3).map(d => `${d.first_name} ${d.last_name}`).join(', ')}
            {doctorNames.length > 3 && ` +${doctorNames.length - 3} more`}
          </div>
        )}
        
        {delegateNames && delegateNames.length > 0 && (
          <div>
            <span className="font-medium">Delegates:</span>{' '}
            {delegateNames.slice(0, 3).map(d => `${d.first_name} ${d.last_name}`).join(', ')}
            {delegateNames.length > 3 && ` +${delegateNames.length - 3} more`}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetedEntities;
