
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, BarChart3, Download, RefreshCw, Settings } from 'lucide-react';

interface ActionItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: ActionItem[];
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Action Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
          {actions.map((action, index) => (
            <Card 
              key={index}
              className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color || 'bg-blue-100'}`}>
                    <action.icon className={`h-4 w-4 ${action.color ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={toggleMenu}
        className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        size="sm"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
