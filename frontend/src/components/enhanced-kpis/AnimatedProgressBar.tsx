
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface AnimatedProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  showPercentage?: boolean;
  animated?: boolean;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max,
  label,
  color = 'blue',
  showPercentage = true,
  animated = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = max > 0 ? (value / max) * 100 : 0;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'blue':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getThresholdColor = () => {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <span className={`text-sm font-semibold ${
            percentage >= 80 ? 'text-green-600' :
            percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {displayValue.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="relative">
        <Progress 
          value={displayValue} 
          className={`h-3 transition-all duration-1000 ease-out ${getColorClasses()}`}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedProgressBar;
