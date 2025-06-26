
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface RecruitmentData {
  id: string;
  delegate_name: string;
  brick_name: string;
  product_name: string;
  target: number;
  achievement: number;
  achievement_percentage: number;
  monthly_targets: number[];
  monthly_achievements: number[];
}

interface RecruitmentTableProps {
  data: RecruitmentData[];
  selectedMonth: number;
  selectedYear: number;
  isLoading: boolean;
}

const RecruitmentTable: React.FC<RecruitmentTableProps> = ({
  data,
  selectedMonth,
  selectedYear,
  isLoading
}) => {
  const getRecruitmentRhythmColor = (rhythm: number) => {
    if (rhythm >= 80) return 'text-green-600 bg-green-100';
    if (rhythm >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRowColorClass = (rhythm: number) => {
    if (rhythm >= 80) return 'bg-green-50 border-l-4 border-l-green-500';
    if (rhythm >= 50) return 'bg-yellow-50 border-l-4 border-l-yellow-500';
    return 'bg-red-50 border-l-4 border-l-red-500';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recruitment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Recruitment Analysis - {selectedMonth}/{selectedYear}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Plans Found</h3>
            <p className="text-gray-600">
              No sales plans found for the selected criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delegate</TableHead>
                  <TableHead>Brick</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Target</TableHead>
                  <TableHead className="text-center">Achievement</TableHead>
                  <TableHead className="text-center">Recruitment Rhythm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} className={getRowColorClass(item.achievement_percentage)}>
                    <TableCell className="font-medium">
                      {item.delegate_name}
                    </TableCell>
                    <TableCell>
                      {item.brick_name}
                    </TableCell>
                    <TableCell>
                      {item.product_name}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.target}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.achievement}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecruitmentRhythmColor(item.achievement_percentage)}`}>
                        {item.achievement_percentage}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecruitmentTable;
