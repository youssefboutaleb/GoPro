
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Stethoscope, Package } from 'lucide-react';

interface TargetedEntitiesProps {
  targetedProducts?: string[] | null;
  targetedBricks?: string[] | null;
  targetedDoctors?: string[] | null;
  targetedDelegates?: string[] | null;
  targetedSupervisors?: string[] | null;
  targetedSalesDirectors?: string[] | null;
}

const TargetedEntities: React.FC<TargetedEntitiesProps> = ({
  targetedProducts = null,
  targetedBricks = null,
  targetedDoctors = null,
  targetedDelegates = null,
  targetedSupervisors = null,
  targetedSalesDirectors = null
}) => {
  // Safely handle null values by converting to empty arrays
  const safeProducts = targetedProducts ?? [];
  const safeBricks = targetedBricks ?? [];
  const safeDoctors = targetedDoctors ?? [];
  const safeDelegates = targetedDelegates ?? [];
  const safeSupervisors = targetedSupervisors ?? [];
  const safeSalesDirectors = targetedSalesDirectors ?? [];

  const { data: productNames } = useQuery({
    queryKey: ['product-names', safeProducts],
    queryFn: async () => {
      if (safeProducts.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .in('id', safeProducts);
      if (error) throw error;
      return data;
    },
    enabled: safeProducts.length > 0
  });

  const { data: brickNames } = useQuery({
    queryKey: ['brick-names', safeBricks],
    queryFn: async () => {
      if (safeBricks.length === 0) return [];
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name')
        .in('id', safeBricks);
      if (error) throw error;
      return data;
    },
    enabled: safeBricks.length > 0
  });

  const { data: doctorNames } = useQuery({
    queryKey: ['doctor-names', safeDoctors],
    queryFn: async () => {
      if (safeDoctors.length === 0) return [];
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
        .in('id', safeDoctors);
      if (error) throw error;
      return data;
    },
    enabled: safeDoctors.length > 0
  });

  const { data: delegateNames } = useQuery({
    queryKey: ['delegate-names', safeDelegates],
    queryFn: async () => {
      if (safeDelegates.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', safeDelegates);
      if (error) throw error;
      return data;
    },
    enabled: safeDelegates.length > 0
  });

  const totalPeople = safeDelegates.length + safeSupervisors.length + safeSalesDirectors.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {safeProducts.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            {safeProducts.length} Product{safeProducts.length > 1 ? 's' : ''}
          </Badge>
        )}
        
        {safeBricks.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {safeBricks.length} Brick{safeBricks.length > 1 ? 's' : ''}
          </Badge>
        )}
        
        {safeDoctors.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Stethoscope className="w-3 h-3 mr-1" />
            {safeDoctors.length} Doctor{safeDoctors.length > 1 ? 's' : ''}
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
