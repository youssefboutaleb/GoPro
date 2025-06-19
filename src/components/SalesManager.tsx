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
import { supabase } from '@/integrations/supabase/client';
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

const SalesManager: React.FC<SalesManagerProps> = ({ onBack }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<Sales | null>(null);
  const [selectedSalesPlan, setSelectedSalesPlan] = useState<string>('');
  const [formData, setFormData] = useState({
    sales_plan_id: '',
    year: new Date().getFullYear(),
    targets: Array(12).fill(0),
    achievements: Array(12).fill(0)
  });

  const queryClient = useQueryClient();

  // Fetch sales plans with related data
  const { data: salesPlans = [] } = useQuery({
    queryKey: ['sales-plans-with-details'],
    queryFn: async () => {
      // First get sales plans
      const { data: salesPlansData, error: salesPlansError } = await supabase
        .from('sales_plans')
        .select('*');

      if (salesPlansError) throw salesPlansError;

      // Then get related data separately to avoid relationship issues
      const [profilesResult, productsResult, bricksResult] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name'),
        supabase.from('products').select('id, name'),
        supabase.from('bricks').select('id, name')
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (productsResult.error) throw productsResult.error;
      if (bricksResult.error) throw bricksResult.error;

      // Map the data together
      return salesPlansData.map(plan => {
        const profile = profilesResult.data?.find(p => p.id === plan.delegate_id);
        const product = productsResult.data?.find(p => p.id === plan.product_id);
        const brick = bricksResult.data?.find(b => b.id === plan.brick_id);

        return {
          ...plan,
          delegate_name: profile ? `${profile.first_name} ${profile.last_name}` : '',
          product_name: product?.name || '',
          brick_name: brick?.name || ''
        };
      }) as SalesPlan[];
    },
  });

  // Fetch sales data
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ['sales-data', selectedSalesPlan],
    queryFn: async () => {
      let query = supabase.from('sales').select('*');
      
      if (selectedSalesPlan) {
        query = query.eq('sales_plan_id', selectedSalesPlan);
      }

      const { data, error } = await query.order('year', { ascending: false });

      if (error) throw error;
      return data as Sales[];
    },
  });

  // Create sales mutation
  const createSalesMutation = useMutation({
    mutationFn: async (salesData: { sales_plan_id: string; year: number; targets: number[]; achievements: number[] }) => {
      const { data, error } = await supabase
        .from('sales')
        .insert([salesData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      toast.success('Sales data created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error creating sales data: ${error.message}`);
    },
  });

  // Update sales mutation
  const updateSalesMutation = useMutation({
    mutationFn: async ({ id, ...salesData }: { id: string; sales_plan_id: string; year: number; targets: number[]; achievements: number[] }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(salesData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      toast.success('Sales data updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error updating sales data: ${error.message}`);
    },
  });

  // Delete sales mutation
  const deleteSalesMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
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

  const getSalesPlanInfo = (salesPlanId: string) => {
    const plan = salesPlans.find(p => p.id === salesPlanId);
    return plan ? `${plan.delegate_name} - ${plan.product_name} - ${plan.brick_name}` : salesPlanId;
  };

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
                <Label>Sales Plan</Label>
                <Select value={selectedSalesPlan} onValueChange={setSelectedSalesPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sales plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sales plans</SelectItem>
                    {salesPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {getSalesPlanInfo(plan.id)}
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
              <CardTitle>Sales Data ({salesData.length})</CardTitle>
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
                                {getSalesPlanInfo(plan.id)}
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Plan</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Total Target</TableHead>
                    <TableHead>Total Achievement</TableHead>
                    <TableHead>Achievement %</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sales) => {
                    const totalTarget = sales.targets.reduce((sum, target) => sum + target, 0);
                    const totalAchievement = sales.achievements.reduce((sum, achievement) => sum + achievement, 0);
                    const achievementPercentage = totalTarget > 0 ? Math.round((totalAchievement / totalTarget) * 100) : 0;

                    return (
                      <TableRow key={sales.id}>
                        <TableCell className="font-medium">
                          {getSalesPlanInfo(sales.sales_plan_id)}
                        </TableCell>
                        <TableCell>{sales.year}</TableCell>
                        <TableCell>{totalTarget}</TableCell>
                        <TableCell>{totalAchievement}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            achievementPercentage >= 100 ? 'bg-green-100 text-green-800' :
                            achievementPercentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {achievementPercentage}%
                          </span>
                        </TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesManager;
