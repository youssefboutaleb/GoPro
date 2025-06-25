
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ProgressiveAuthLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProgressiveAuthLoader: React.FC<ProgressiveAuthLoaderProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, profile, profileLoading } = useAuth();

  // If user is not authenticated, don't render anything
  if (!user) {
    return null;
  }

  // If profile is still loading, show skeleton or custom fallback
  if (profileLoading && !profile) {
    return fallback || <ProfileLoadingSkeleton />;
  }

  // Render children with available data
  return <>{children}</>;
};

const ProfileLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Navigation skeleton */}
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Dashboard cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveAuthLoader;
