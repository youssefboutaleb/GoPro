
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard/Dashboard';
import BricksManager from '@/components/admin/BricksManager';
import DoctorsManager from '@/components/admin/DoctorsManager';
import ProductsManager from '@/components/admin/ProductsManager';
import VisitsManager from '@/components/admin/VisitsManager';
import UsersManager from '@/components/admin/UsersManager';
import ReportsManager from '@/components/admin/ReportsManager';

interface MainContentProps {
  activeTab: string;
  onBack: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, onBack }) => {
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onBack={onBack} />;
      
      case 'doctors-visits':
        return (
          <div>
            <Button 
              onClick={() => navigate('/doctors-visits')} 
              className="mb-4"
            >
              Voir la page complète des visites
            </Button>
          </div>
        );
      
      case 'products-sales':
        return (
          <div>
            <Button 
              onClick={() => navigate('/products-sales')} 
              className="mb-4"
            >
              Voir la page complète des ventes
            </Button>
          </div>
        );
      
      case 'bricks':
        return <BricksManager onBack={onBack} />;
      
      case 'doctors':
        return <DoctorsManager onBack={onBack} />;
      
      case 'products':
        return <ProductsManager onBack={onBack} />;
      
      case 'visits':
        return <VisitsManager onBack={onBack} />;
      
      case 'users':
        return <UsersManager onBack={onBack} />;
      
      case 'reports':
        return <ReportsManager onBack={onBack} />;
      
      default:
        return <Dashboard onBack={onBack} />;
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
};

export default MainContent;
