
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Package, RotateCcw } from 'lucide-react';

interface NavigationCardsProps {
  setActiveTab: (tab: string) => void;
}

const NavigationCards = ({ setActiveTab }: NavigationCardsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => setActiveTab('medecins')}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Médecins Ciblés</CardTitle>
              <CardDescription className="text-blue-100">
                Gestion et suivi des médecins par spécialité
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Cardiologues</span>
              <Badge variant="secondary" className="bg-white/20 text-white">89</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Généralistes</span>
              <Badge variant="secondary" className="bg-white/20 text-white">156</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Diabétologues</span>
              <Badge variant="secondary" className="bg-white/20 text-white">97</Badge>
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
            Voir la liste complète
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => setActiveTab('produits')}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Produits & KPIs</CardTitle>
              <CardDescription className="text-green-100">
                Performance des ventes par produit
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-100">Nebilet</span>
              <Badge variant="secondary" className="bg-white/20 text-white">85%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-100">Zantipride</span>
              <Badge variant="secondary" className="bg-white/20 text-white">92%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-100">Zantipress</span>
              <Badge variant="secondary" className="bg-white/20 text-white">78%</Badge>
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
            Analyser les performances
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => setActiveTab('indice-retour')}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <RotateCcw className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Indice de Retour</CardTitle>
              <CardDescription className="text-purple-100">
                Analyse des médecins par spécialité et brick
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Total médecins</span>
              <Badge variant="secondary" className="bg-white/20 text-white">342</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Par spécialité</span>
              <Badge variant="secondary" className="bg-white/20 text-white">3</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Par brick</span>
              <Badge variant="secondary" className="bg-white/20 text-white">4</Badge>
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
            Consulter l'indice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationCards;
