
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  UserCheck,
  ShoppingCart
} from 'lucide-react';

export const mainMenuItems = [
  {
    title: "Tableau de bord",
    icon: TrendingUp,
    id: "dashboard"
  },
  {
    title: "Visites médecins",
    icon: UserCheck,
    id: "doctors-visits"
  },
  {
    title: "Ventes produits",
    icon: ShoppingCart,
    id: "products-sales"
  }
];

export const adminMenuItems = [
  {
    title: "Gestion des Bricks",
    icon: Target,
    id: "bricks"
  },
  {
    title: "Gestion des Médecins",
    icon: Users,
    id: "doctors"
  },
  {
    title: "Gestion des Produits",
    icon: ShoppingCart,
    id: "products"
  },
  {
    title: "Gestion des Visites",
    icon: Calendar,
    id: "visits"
  },
  {
    title: "Gestion des Utilisateurs",
    icon: Users,
    id: "users"
  },
  {
    title: "Rapports",
    icon: TrendingUp,
    id: "reports"
  }
];
