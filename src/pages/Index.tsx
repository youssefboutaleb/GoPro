
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';
import Header from '@/components/layout/Header';
import MainContent from '@/components/layout/MainContent';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleBack = () => {
    setActiveTab('dashboard');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1">
          <Header activeTab={activeTab} />
          <MainContent activeTab={activeTab} onBack={handleBack} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
