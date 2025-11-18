import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RecruitmentFiltersProps {
  selectedProduct: string;
  selectedBrick: string;
  selectedDelegate: string;
  selectedSupervisor: string;
  onProductChange: (value: string) => void;
  onBrickChange: (value: string) => void;
  onDelegateChange: (value: string) => void;
  onSupervisorChange: (value: string) => void;
  onClearFilters: () => void;
  products: Array<{ id: string; name: string }>;
  bricks: Array<{ id: string; name: string }>;
  delegates: Array<{ id: string; first_name: string; last_name: string }>;
  supervisors: Array<{ id: string; first_name: string; last_name: string }>;
  isSalesDirectorView: boolean;
}

const RecruitmentFilters: React.FC<RecruitmentFiltersProps> = ({
  selectedProduct,
  selectedBrick,
  selectedDelegate,
  selectedSupervisor,
  onProductChange,
  onBrickChange,
  onDelegateChange,
  onSupervisorChange,
  onClearFilters,
  products,
  bricks,
  delegates,
  supervisors,
  isSalesDirectorView,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Product Filter - Disabled since only Nebilet */}
          <Select value={selectedProduct} onValueChange={onProductChange} disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.name}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brick Filter */}
          <Select value={selectedBrick} onValueChange={onBrickChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Bricks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bricks</SelectItem>
              {bricks.map(brick => (
                <SelectItem key={brick.id} value={brick.name}>
                  {brick.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Supervisor Filter - Sales Director only */}
          {isSalesDirectorView && (
            <Select value={selectedSupervisor} onValueChange={onSupervisorChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Supervisors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Supervisors</SelectItem>
                {supervisors.map(supervisor => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.first_name} {supervisor.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Delegate Filter */}
          <Select value={selectedDelegate} onValueChange={onDelegateChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Delegates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delegates</SelectItem>
              {delegates.map(delegate => (
                <SelectItem key={delegate.id} value={delegate.id}>
                  {delegate.first_name} {delegate.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecruitmentFilters;
