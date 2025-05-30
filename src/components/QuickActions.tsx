
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Target, UserPlus } from 'lucide-react';

const QuickActions = () => {
  return (
    <div className="mt-8">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Rapport Hebdomadaire</span>
            </Button>
            <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-green-50 hover:border-green-300 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>Analyse Tendances</span>
            </Button>
            <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-purple-50 hover:border-purple-300 transition-colors">
              <Target className="h-4 w-4" />
              <span>Objectifs Mensuel</span>
            </Button>
            <Button variant="outline" className="h-12 flex items-center justify-center space-x-2 hover:bg-orange-50 hover:border-orange-300 transition-colors">
              <UserPlus className="h-4 w-4" />
              <span>Rythme Recrutement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
