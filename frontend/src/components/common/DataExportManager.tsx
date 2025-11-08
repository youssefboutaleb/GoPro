
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, Database, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ExportConfig {
  dataType: 'kpis' | 'visits' | 'sales' | 'team' | 'all';
  format: 'csv' | 'excel' | 'json' | 'pdf';
  includeHeaders: boolean;
  includeMetadata: boolean;
  dateRange: 'all' | 'current-month' | 'last-3-months' | 'custom';
}

interface DataExportManagerProps {
  onExport?: (config: ExportConfig) => void;
  onImport?: (file: File, dataType: string) => void;
}

const DataExportManager: React.FC<DataExportManagerProps> = ({ onExport, onImport }) => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    dataType: 'kpis',
    format: 'csv',
    includeHeaders: true,
    includeMetadata: false,
    dateRange: 'current-month'
  });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importDataType, setImportDataType] = useState<string>('visits');

  const dataTypes = [
    { value: 'kpis', label: 'KPI Data', icon: FileSpreadsheet, description: 'Performance metrics and indicators' },
    { value: 'visits', label: 'Visit Records', icon: FileText, description: 'Doctor visit logs and details' },
    { value: 'sales', label: 'Sales Data', icon: Database, description: 'Sales performance and targets' },
    { value: 'team', label: 'Team Information', icon: Database, description: 'Team structure and assignments' },
    { value: 'all', label: 'Complete Export', icon: Database, description: 'All available data' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onExport) {
        onExport(exportConfig);
      }
      
      // Simulate file download
      const filename = `${exportConfig.dataType}_export_${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
      toast.success(`Export completed: ${filename}`);
      
      setIsExportOpen(false);
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      if (onImport) {
        onImport(selectedFile, importDataType);
      }
      
      toast.success(`Import completed: ${selectedFile.name}`);
      setIsImportOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Import failed. Please check the file format.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex space-x-2">
      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Data Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Data Type</Label>
              <div className="grid gap-2">
                {dataTypes.map((type) => (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all p-3 ${
                      exportConfig.dataType === type.value ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setExportConfig(prev => ({ ...prev, dataType: type.value as any }))}
                  >
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Export Format</Label>
              <Select value={exportConfig.format} onValueChange={(value) => setExportConfig(prev => ({ ...prev, format: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="excel">Excel Workbook</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Date Range</Label>
              <Select value={exportConfig.dateRange} onValueChange={(value) => setExportConfig(prev => ({ ...prev, dateRange: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headers"
                    checked={exportConfig.includeHeaders}
                    onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeHeaders: !!checked }))}
                  />
                  <Label htmlFor="headers" className="text-sm">Include column headers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={exportConfig.includeMetadata}
                    onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeMetadata: !!checked }))}
                  />
                  <Label htmlFor="metadata" className="text-sm">Include metadata and timestamps</Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Import Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Data Type</Label>
              <Select value={importDataType} onValueChange={setImportDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visits">Visit Records</SelectItem>
                  <SelectItem value="sales">Sales Data</SelectItem>
                  <SelectItem value="team">Team Information</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports CSV, Excel, and JSON formats
                  </p>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!selectedFile}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataExportManager;
