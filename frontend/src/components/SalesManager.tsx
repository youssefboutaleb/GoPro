import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SalesManagerProps {
  onBack: () => void;
}

interface SalesPlan {
  id: string;
  delegate_id: string;
  product_id: string;
  brick_id: string;
  delegate_name?: string;
  product_name?: string;
  brick_name?: string;
}

interface Sales {
  id: string;
  sales_plan_id: string;
  year: number;
  targets: number[];
  achievements: number[];
}

interface SalesWithPlan extends Sales {
  sales_plan?: SalesPlan;
}

// Delegate colors for grouping
const delegateColors = [
  'bg-blue-50 border-l-4 border-blue-400',
  'bg-green-50 border-l-4 border-green-400', 
  'bg-purple-50 border-l-4 border-purple-400',
  'bg-orange-50 border-l-4 border-orange-400',
  'bg-pink-50 border-l-4 border-pink-400',
  'bg-indigo-50 border-l-4 border-indigo-400',
  'bg-yellow-50 border-l-4 border-yellow-400',
  'bg-red-50 border-l-4 border-red-400'
];

const SalesManager: React.FC<SalesManagerProps> = ({ onBack }) => {
  const { getToken } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<Sales | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [formData, setFormData] = useState({
    sales_plan_id: '',
    year: new Date().getFullYear(),
    targets: Array(12).fill(0),
    achievements: Array(12).fill(0)
  });

  const queryClient = useQueryClient();

  // Helper to get token
  const getTokenValue = () => {
    try {
      return getToken?.() || undefined;
    } catch {
      return undefined;
    }
  };

  // Fetch ALL sales plans with related data (admin can see all)
  const { data: salesPlans = [] } = useQuery({
    queryKey: ['admin-sales-plans-with-details'],
    queryFn: async () => {
      console.log('Admin fetching ALL sales plans...');
      const token = getTokenValue();
      
      // Fetch all data in parallel
      const [salesPlansData, profilesData, productsData, bricksData] = await Promise.all([
        apiService.getSalesPlans(token),
        apiService.getProfiles(token),
        apiService.getProducts(token),
        apiService.getBricks(token)
      ]);

      console.log('Fetched related data:', { 
        profiles: profilesData, 
        products: productsData, 
        bricks: bricksData 
      });

      // Map the data together
      const enrichedPlans = (salesPlansData || []).map((plan: any) => {
        const profile = (profilesData || []).find((p: any) => p.id === plan.delegateId);
        const product = (productsData || []).find((p: any) => p.id === plan.productId);
        const brick = (bricksData || []).find((b: any) => b.id === plan.brickId);

        return {
          id: plan.id,
          delegate_id: plan.delegateId,
          product_id: plan.productId,
          brick_id: plan.brickId,
          delegate_name: profile ? `${profile.firstName} ${profile.lastName}` : '',
          product_name: product?.name || '',
          brick_name: brick?.name || ''
        };
      }) as SalesPlan[];

      console.log('Enriched sales plans:', enrichedPlans);
      return enrichedPlans;
    },
  });

  // Fetch ALL sales data with plans (admin can see all)
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['admin-sales-data-with-plans', selectedYear],
    queryFn: async () => {
      console.log('Admin fetching ALL sales data...');
      const token = getTokenValue();
      
      const allSales = await apiService.getSales(token);
      
      // Filter by year if selected
      let filteredSales = allSales || [];
      if (selectedYear) {
        filteredSales = filteredSales.filter((sale: any) => sale.year === parseInt(selectedYear));
      }
      
      // Sort by year descending
      filteredSales.sort((a: any, b: any) => b.year - a.year);

      console.log('Fetched sales data:', filteredSales);

      // Enrich with sales plan information
      const salesWithPlans = filteredSales.map((sale: any) => {
        const salesPlan = salesPlans.find(sp => sp.id === sale.salesPlanId);
        return {
          id: sale.id,
          sales_plan_id: sale.salesPlanId,
          year: sale.year,
          targets: sale.targets || Array(12).fill(0),
          achievements: sale.achievements || Array(12).fill(0),
          sales_plan: salesPlan
        };
      });

      console.log('Sales with plans:', salesWithPlans);
      return salesWithPlans as SalesWithPlan[];
    },
    enabled: salesPlans.length > 0,
  });

  const createSalesMutation = useMutation({
    mutationFn: async (salesData: { sales_plan_id: string; year: number; targets: number[]; achievements: number[] }) => {
      const token = getTokenValue();
      const data = {
        salesPlanId: salesData.sales_plan_id,
        year: salesData.year,
        targets: salesData.targets,
        achievements: salesData.achievements
      };
      return await apiService.createSales(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales-data-with-plans'] });
      toast.success('Sales data created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error creating sales data: ${error.message}`);
    },
  });

  const updateSalesMutation = useMutation({
    mutationFn: async ({ id, ...salesData }: { id: string; sales_plan_id: string; year: number; targets: number[]; achievements: number[] }) => {
      const token = getTokenValue();
      const data = {
        salesPlanId: salesData.sales_plan_id,
        year: salesData.year,
        targets: salesData.targets,
        achievements: salesData.achievements
      };
      return await apiService.updateSales(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales-data-with-plans'] });
      toast.success('Sales data updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error updating sales data: ${error.message}`);
    },
  });

  const deleteSalesMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getTokenValue();
      await apiService.deleteSales(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales-data-with-plans'] });
      toast.success('Sales data deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting sales data: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      sales_plan_id: '',
      year: new Date().getFullYear(),
      targets: Array(12).fill(0),
      achievements: Array(12).fill(0)
    });
    setEditingSales(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sales_plan_id) {
      toast.error('Please select a sales plan');
      return;
    }

    if (editingSales) {
      updateSalesMutation.mutate({
        id: editingSales.id,
        ...formData
      });
    } else {
      createSalesMutation.mutate(formData);
    }
  };

  const handleEdit = (sales: Sales) => {
    setEditingSales(sales);
    setFormData({
      sales_plan_id: sales.sales_plan_id,
      year: sales.year,
      targets: sales.targets,
      achievements: sales.achievements
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this sales data?')) {
      deleteSalesMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleTargetChange = (index: number, value: string) => {
    const newTargets = [...formData.targets];
    newTargets[index] = parseInt(value) || 0;
    setFormData({ ...formData, targets: newTargets });
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = parseInt(value) || 0;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getVisibleMonths = (year: number) => {
    if (year === currentYear) {
      return currentMonth + 1;
    } else if (year < currentYear) {
      return 12;
    } else {
      return 0;
    }
  };

  const getSalesPlanInfo = (salesPlan?: SalesPlan) => {
    if (!salesPlan) return 'N/A';
    return `${salesPlan.delegate_name} - ${salesPlan.product_name} - ${salesPlan.brick_name}`;
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const getSalesGroupedByDelegate = () => {
    const grouped = salesData.reduce((acc, sale) => {
      const delegateName = sale.sales_plan?.delegate_name || 'Non assigné';
      
      if (!acc[delegateName]) {
        acc[delegateName] = [];
      }
      acc[delegateName].push(sale);
      return acc;
    }, {} as Record<string, SalesWithPlan[]>);

    return grouped;
  };

  const getDelegateColor = (delegateName: string, delegateIndex: number) => {
    return delegateColors[delegateIndex % delegateColors.length];
  };

  const delegateNames = Object.keys(getSalesGroupedByDelegate());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-blue-50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
                <p className="text-sm text-gray-600">Manage sales targets and achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Filter Sales Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Data Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plans de Vente ({salesData.length}) - Groupés par délégué</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sales Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSales ? 'Edit Sales Data' : 'Create New Sales Data'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sales_plan_id">Sales Plan *</Label>
                        <Select value={formData.sales_plan_id} onValueChange={(value) => setFormData({ ...formData, sales_plan_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sales plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {salesPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {getSalesPlanInfo(plan)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                          min="2000"
                          max="2100"
                          required
                        />
                      </div>
                    </div>

                    {/* Monthly Targets and Achievements */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Monthly Data</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left p-2">Month</th>
                              <th className="text-left p-2">Target</th>
                              <th className="text-left p-2">Achievement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthNames.map((month, index) => (
                              <tr key={month}>
                                <td className="p-2 font-medium">{month}</td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    value={formData.targets[index]}
                                    onChange={(e) => handleTargetChange(index, e.target.value)}
                                    min="0"
                                    className="w-24"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    value={formData.achievements[index]}
                                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                                    min="0"
                                    className="w-24"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createSalesMutation.isPending || updateSalesMutation.isPending}
                      >
                        {editingSales ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto space-y-6">
              {delegateNames.map((delegateName, delegateIndex) => (
                <div key={delegateName} className={`rounded-lg p-4 ${getDelegateColor(delegateName, delegateIndex)}`}>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    {delegateName} ({getSalesGroupedByDelegate()[delegateName].length} plans)
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Brique</TableHead>
                        <TableHead>Année</TableHead>
                        {monthNames.slice(0, Math.max(...getSalesGroupedByDelegate()[delegateName].map(s => getVisibleMonths(s.year)))).map((month) => (
                          <TableHead key={month} className="text-center min-w-20">
                            {month}
                          </TableHead>
                        ))}
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSalesGroupedByDelegate()[delegateName].map((sales) => {
                        const visibleMonths = getVisibleMonths(sales.year);
                        
                        return (
                          <TableRow key={sales.id}>
                            <TableCell>{sales.sales_plan?.product_name || 'N/A'}</TableCell>
                            <TableCell>{sales.sales_plan?.brick_name || 'N/A'}</TableCell>
                            <TableCell>{sales.year}</TableCell>
                            {Array.from({ length: visibleMonths }, (_, i) => (
                              <TableCell key={i} className="text-center">
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-500">T: {sales.targets[i] || 0}</div>
                                  <div className={`text-xs font-medium ${
                                    (sales.achievements[i] || 0) >= (sales.targets[i] || 0) 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    A: {sales.achievements[i] || 0}
                                  </div>
                                </div>
                              </TableCell>
                            ))}
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(sales)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(sales.id)}
                                  disabled={deleteSalesMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesManager;
