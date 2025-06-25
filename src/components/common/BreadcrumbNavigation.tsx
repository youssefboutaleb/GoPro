
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ArrowLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  onBack?: () => void;
  showHomeIcon?: boolean;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  onBack,
  showHomeIcon = true
}) => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      
      <Breadcrumb>
        <BreadcrumbList>
          {showHomeIcon && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center space-x-1">
                  <Home className="h-3 w-3" />
                  <span>Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {items.length > 0 && <BreadcrumbSeparator />}
            </>
          )}
          
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {index === items.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={item.href}
                    onClick={item.onClick}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNavigation;
