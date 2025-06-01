
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { mainMenuItems, adminMenuItems } from '@/config/menuItems';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const getPageTitle = () => {
    return mainMenuItems.find(item => item.id === activeTab)?.title ||
           adminMenuItems.find(item => item.id === activeTab)?.title ||
           'GOPRO Dashboard';
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger />
        <div className="ml-4">
          <h1 className="text-lg font-semibold">
            {getPageTitle()}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Header;
