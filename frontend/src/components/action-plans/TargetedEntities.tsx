
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
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

  // Helper to get token
  const getToken = () => {
    try {
      const keycloak = (window as any).keycloak;
      if (keycloak?.token) return keycloak.token;
    } catch {}
    return undefined;
  };

  const { data: productNames } = useQuery({
    queryKey: ['product-names', safeProducts],
    queryFn: async () => {
      if (safeProducts.length === 0) return [];
      const token = getToken();
      const allProducts = await apiService.getProducts(token);
      return (allProducts || []).filter((p: any) => safeProducts.includes(p.id));
    },
    enabled: safeProducts.length > 0
  });

  const { data: brickNames } = useQuery({
    queryKey: ['brick-names', safeBricks],
    queryFn: async () => {
      if (safeBricks.length === 0) return [];
      const token = getToken();
      const allBricks = await apiService.getBricks(token);
      return (allBricks || []).filter((b: any) => safeBricks.includes(b.id));
    },
    enabled: safeBricks.length > 0
  });

  const { data: doctorNames } = useQuery({
    queryKey: ['doctor-names', safeDoctors],
    queryFn: async () => {
      if (safeDoctors.length === 0) return [];
      const token = getToken();
      const allDoctors = await apiService.getDoctors(token);
      return (allDoctors || []).filter((d: any) => safeDoctors.includes(d.id))
        .map((d: any) => ({ id: d.id, first_name: d.firstName, last_name: d.lastName }));
    },
    enabled: safeDoctors.length > 0
  });

  const { data: delegateNames } = useQuery({
    queryKey: ['delegate-names', safeDelegates],
    queryFn: async () => {
      if (safeDelegates.length === 0) return [];
      const token = getToken();
      const allProfiles = await apiService.getProfiles(token);
      return (allProfiles || []).filter((p: any) => safeDelegates.includes(p.id))
        .map((p: any) => ({ id: p.id, first_name: p.firstName, last_name: p.lastName }));
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
