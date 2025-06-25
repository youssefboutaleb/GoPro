
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ReportConfig {
  type: 'performance' | 'sales' | 'visits' | 'team';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
  customDateRange?: {
    start: string;
    end: string;
  };
}

interface ReportGeneratorProps {
  delegateIds?: string[];
  onGenerateReport?: (config: ReportConfig) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
  delegateIds = [], 
  onGenerateReport 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    type: 'performance',
    period: 'monthly',
    format: 'pdf',
    includeCharts: true,
    includeSummary: true,
    includeDetails: false
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'performance', label: 'Performance Overview', icon: TrendingUp },
    { value: 'sales', label: 'Sales Analysis', icon: BarChart3 },
    { value: 'visits', label: 'Visit Report', icon: Calendar },
    { value: 'team', label: 'Team Summary', icon: Users }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onGenerateReport) {
        onGenerateReport(config);
      }
      
      toast.success(`${config.type} report generated successfully!`);
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSampleReport = (type: string) => {
    toast.success(`Downloading sample ${type} report...`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Generate Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Custom Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Report Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    config.type === type.value ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, type: type.value as any }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Time Period</Label>
            <Select value={config.period} onValueChange={(value) => setConfig(prev => ({ ...prev, period: value as any }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {config.period === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={config.customDateRange?.start || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      customDateRange: { ...prev.customDateRange, start: e.target.value, end: prev.customDateRange?.end || '' }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={config.customDateRange?.end || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      customDateRange: { ...prev.customDateRange, end: e.target.value, start: prev.customDateRange?.start || '' }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <Select value={config.format} onValueChange={(value) => setConfig(prev => ({ ...prev, format: value as any }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="excel">Excel Workbook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Include in Report</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeCharts: !!checked }))}
                />
                <Label htmlFor="charts">Charts and Visualizations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={config.includeSummary}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeSummary: !!checked }))}
                />
                <Label htmlFor="summary">Executive Summary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="details"
                  checked={config.includeDetails}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeDetails: !!checked }))}
                />
                <Label htmlFor="details">Detailed Data Tables</Label>
              </div>
            </div>
          </div>

          {/* Sample Reports */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Sample Reports</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadSampleReport('performance')}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Performance Sample</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => downloadSampleReport('sales')}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Sales Sample</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Generate Report</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportGenerator;
