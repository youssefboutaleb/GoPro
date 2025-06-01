
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { ProductSalesWithJoins } from '@/types/productSales';

const ProductsSales = () => {
  const [productSales, setProductSales] = useState<ProductSalesWithJoins[]>([]);
  const [selectedBrick, setSelectedBrick] = useState<string>('all');
  const [bricks, setBricks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductSales();
    fetchBricks();
  }, [selectedBrick]);

  const fetchBricks = async () => {
    try {
      const { data, error } = await supabase
        .from('bricks')
        .select('*')
        .order('region', { ascending: true });

      if (error) throw error;
      setBricks(data || []);
    } catch (error) {
      console.error('Error fetching bricks:', error);
    }
  };

  const fetchProductSales = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('product_sales')
        .select(`
          *,
          products (name),
          bricks (name, region)
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (selectedBrick !== 'all') {
        query = query.eq('brick_id', selectedBrick);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProductSales(data || []);
    } catch (error) {
      console.error('Error fetching product sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (actual: number, target: number) => {
    return target > 0 ? Math.round((actual / target) * 100) : 0;
  };

  const calculatePrescriptionsNeeded = (target: number, actual: number, month: number, year: number) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Calculate remaining months in the year
    let remainingMonths;
    if (year > currentYear) {
      remainingMonths = 12;
    } else if (year === currentYear) {
      remainingMonths = 12 - currentMonth + 1;
    } else {
      remainingMonths = 1; // Past year, no remaining months
    }

    const remaining = target - actual;
    return remainingMonths > 0 ? Math.ceil(remaining / remainingMonths) : remaining;
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 100) {
      return <Badge className="bg-green-100 text-green-800">Objectif atteint</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-yellow-100 text-yellow-800">Proche de l'objectif</Badge>;
    } else if (percentage >= 50) {
      return <Badge className="bg-orange-100 text-orange-800">En cours</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
    }
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ventes par produit</CardTitle>
          <CardDescription>
            Suivi des objectifs de vente par produit et par brick
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="text-sm font-medium">Filtrer par Brick</label>
            <Select value={selectedBrick} onValueChange={setSelectedBrick}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les bricks</SelectItem>
                {bricks.map(brick => (
                  <SelectItem key={brick.id} value={brick.id}>
                    {brick.name} ({brick.region})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Brick</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Objectif</TableHead>
                <TableHead>Réalisé</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Prescriptions/mois nécessaires</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productSales.map((sale) => {
                const percentage = calculatePercentage(sale.actual_sales, sale.target_sales);
                const prescriptionsNeeded = calculatePrescriptionsNeeded(
                  sale.target_sales, 
                  sale.actual_sales, 
                  sale.month, 
                  sale.year
                );

                return (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.products?.name || 'Produit inconnu'}
                    </TableCell>
                    <TableCell>
                      {sale.bricks ? `${sale.bricks.name} (${sale.bricks.region})` : 'Brick inconnu'}
                    </TableCell>
                    <TableCell>
                      {months[sale.month - 1]} {sale.year}
                    </TableCell>
                    <TableCell>{sale.target_sales.toLocaleString()}</TableCell>
                    <TableCell>{sale.actual_sales.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={prescriptionsNeeded > 0 ? "outline" : "default"}>
                        {prescriptionsNeeded > 0 ? prescriptionsNeeded.toLocaleString() : '0'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(percentage)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {productSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de vente disponible pour le brick sélectionné
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsSales;
