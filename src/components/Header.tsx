
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, MapPin } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GOPRO</h1>
              <p className="text-sm text-gray-600">Goal Performance Reporting Outil</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3 mr-1" />
              Semaine 47
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <MapPin className="h-3 w-3 mr-1" />
              Région Nord
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
