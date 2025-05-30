
import { useState } from 'react';
import MedecinsList from '@/components/MedecinsList';
import ProductsList from '@/components/ProductsList';
import IndiceRetour from '@/components/IndiceRetour';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import NavigationCards from '@/components/NavigationCards';
import QuickActions from '@/components/QuickActions';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  if (activeTab === 'medecins') {
    return <MedecinsList onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'produits') {
    return <ProductsList onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'indice-retour') {
    return <IndiceRetour onBack={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsCards />
        <NavigationCards setActiveTab={setActiveTab} />
        <QuickActions />
      </div>
    </div>
  );
};

export default Index;
