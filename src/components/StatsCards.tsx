
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, TrendingUp, Target } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: "Médecins Ciblés",
      value: "342",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Produits Actifs",
      value: "8",
      change: "+2",
      icon: Package,
      color: "text-green-600"
    },
    {
      title: "Objectif Mensuel",
      value: "85%",
      change: "+5%",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Performance",
      value: "78%",
      change: "+8%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-green-600 font-medium">
              {stat.change} vs mois dernier
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
