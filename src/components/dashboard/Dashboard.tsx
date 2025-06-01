
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  UserCheck,
  ShoppingCart
} from 'lucide-react';
import IndiceRetour from '@/components/IndiceRetour';
import RythmeRecrutement from '@/components/RythmeRecrutement';
import MedecinsList from '@/components/MedecinsList';
import ProductsList from '@/components/ProductsList';
import RapportMedecins from '@/components/RapportMedecins';

interface DashboardProps {
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indice de Retour</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <IndiceRetour onBack={onBack} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rythme de Recrutement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <RythmeRecrutement onBack={onBack} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médecins Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <MedecinsList onBack={onBack} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ProductsList onBack={onBack} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapport des Médecins</CardTitle>
          <CardDescription>Vue d'ensemble des performances par médecin</CardDescription>
        </CardHeader>
        <CardContent>
          <RapportMedecins onBack={onBack} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
