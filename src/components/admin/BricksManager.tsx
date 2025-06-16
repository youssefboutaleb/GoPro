
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Brick = Database['public']['Tables']['bricks']['Row'];
type Sector = Database['public']['Tables']['sectors']['Row'];

interface BricksManagerProps {
  onBack: () => void;
}

const BricksManager: React.FC<BricksManagerProps> = ({ onBack }) => {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states for bricks
  const [bricksDialogOpen, setBricksDialogOpen] = useState(false);
  const [editingBrick, setEditingBrick] = useState<Brick | null>(null);
  const [brickFormData, setBrickFormData] = useState({
    name: '',
    description: '',
    sector_id: '',
  });

  // Dialog states for sectors
  const [sectorsDialogOpen, setSectorsDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    selectedBricks: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('Starting fetchData...');
    try {
      setLoading(true);
      
      // Fetch bricks with sector information
      const { data: bricksData, error: bricksError } = await supabase
        .from('bricks')
        .select(`
          *,
          sectors:sector_id (
            id,
            name
          )
        `)
        .order('name', { ascending: true });

      if (bricksError) {
        console.error('Error fetching bricks:', bricksError);
        throw bricksError;
      }

      // Fetch all sectors - force fresh data
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });

      if (sectorsError) {
        console.error('Error fetching sectors:', sectorsError);
        throw sectorsError;
      }

      console.log('Fetched bricks:', bricksData);
      console.log('Fetched sectors:', sectorsData);

      setBricks(bricksData || []);
      setSectors(sectorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Unable to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Brick CRUD operations
  const handleBrickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brickFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Brick name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: brickFormData.name.trim(),
        description: brickFormData.description.trim() || null,
        sector_id: brickFormData.sector_id || null,
      };

      if (editingBrick) {
        const { error } = await supabase
          .from('bricks')
          .update(submitData)
          .eq('id', editingBrick.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Brick updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('bricks')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Brick created successfully",
        });
      }

      setBricksDialogOpen(false);
      setEditingBrick(null);
      setBrickFormData({ name: '', description: '', sector_id: '' });
      await fetchData();
    } catch (error) {
      console.error('Error saving brick:', error);
      toast({
        title: "Error",
        description: "Unable to save brick",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrickDelete = async (brick: Brick) => {
    if (confirm(`Are you sure you want to delete the brick "${brick.name}"?`)) {
      try {
        const { error } = await supabase
          .from('bricks')
          .delete()
          .eq('id', brick.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Brick deleted successfully",
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting brick:', error);
        toast({
          title: "Error",
          description: "Unable to delete brick",
          variant: "destructive",
        });
      }
    }
  };

  const openEditBrickDialog = (brick: Brick) => {
    setEditingBrick(brick);
    setBrickFormData({
      name: brick.name,
      description: brick.description || '',
      sector_id: brick.sector_id || '',
    });
    setBricksDialogOpen(true);
  };

  const openCreateBrickDialog = () => {
    setEditingBrick(null);
    setBrickFormData({ name: '', description: '', sector_id: '' });
    setBricksDialogOpen(true);
  };

  // Sector CRUD operations
  const handleSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectorFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Sector name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: sectorFormData.name.trim(),
      };

      let sectorId: string;

      if (editingSector) {
        console.log('Updating sector with ID:', editingSector.id);
        console.log('Updating sector with data:', submitData);
        
        // Update the sector
        const { data: updatedData, error: updateError } = await supabase
          .from('sectors')
          .update(submitData)
          .eq('id', editingSector.id)
          .select();

        if (updateError) {
          console.error('Error updating sector:', updateError);
          throw new Error(`Unable to update sector: ${updateError.message}`);
        }

        if (!updatedData || updatedData.length === 0) {
          console.error('No data returned from update');
          throw new Error('No data returned from update');
        }
        
        console.log('Sector updated successfully:', updatedData[0]);
        sectorId = editingSector.id;
        
        toast({
          title: "Success",
          description: `Sector "${updatedData[0].name}" updated successfully`,
        });
      } else {
        console.log('Creating new sector with data:', submitData);
        
        const { data, error } = await supabase
          .from('sectors')
          .insert([submitData])
          .select()
          .single();

        if (error) {
          console.error('Error creating sector:', error);
          throw error;
        }
        
        console.log('Sector created successfully:', data);
        sectorId = data.id;
        
        toast({
          title: "Success",
          description: "Sector created successfully",
        });
      }

      // Handle brick assignments
      console.log('Updating brick assignments for sector:', sectorId);
      console.log('Selected bricks:', sectorFormData.selectedBricks);

      // Get current brick assignments for this sector
      const currentBricks = bricks.filter(brick => brick.sector_id === sectorId).map(brick => brick.id);
      console.log('Current bricks for sector:', currentBricks);

      // Find bricks to unassign (currently assigned but not selected)
      const bricksToUnassign = currentBricks.filter(brickId => !sectorFormData.selectedBricks.includes(brickId));
      
      // Find bricks to assign (selected but not currently assigned)
      const bricksToAssign = sectorFormData.selectedBricks.filter(brickId => !currentBricks.includes(brickId));

      console.log('Bricks to unassign:', bricksToUnassign);
      console.log('Bricks to assign:', bricksToAssign);

      // Unassign bricks that should no longer be in this sector
      if (bricksToUnassign.length > 0) {
        const { error: unassignError } = await supabase
          .from('bricks')
          .update({ sector_id: null })
          .in('id', bricksToUnassign);

        if (unassignError) {
          console.error('Error unassigning bricks:', unassignError);
          throw unassignError;
        }
      }

      // Assign new bricks to this sector
      if (bricksToAssign.length > 0) {
        const { error: assignError } = await supabase
          .from('bricks')
          .update({ sector_id: sectorId })
          .in('id', bricksToAssign);

        if (assignError) {
          console.error('Error assigning bricks:', assignError);
          throw assignError;
        }
      }

      // Close dialog and reset form
      setSectorsDialogOpen(false);
      setEditingSector(null);
      setSectorFormData({ name: '', selectedBricks: [] });
      
      // Refresh data immediately
      await fetchData();
      
    } catch (error: any) {
      console.error('Error saving sector:', error);
      toast({
        title: "Error",
        description: `Unable to save sector: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectorDelete = async (sector: Sector) => {
    if (confirm(`Are you sure you want to delete the sector "${sector.name}"?`)) {
      try {
        // First, update bricks to remove sector reference
        await supabase
          .from('bricks')
          .update({ sector_id: null })
          .eq('sector_id', sector.id);

        const { error } = await supabase
          .from('sectors')
          .delete()
          .eq('id', sector.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sector deleted successfully",
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting sector:', error);
        toast({
          title: "Error",
          description: "Unable to delete sector",
          variant: "destructive",
        });
      }
    }
  };

  const openEditSectorDialog = (sector: Sector) => {
    console.log('Opening edit dialog for sector:', sector);
    setEditingSector(sector);
    const sectorBricks = bricks.filter(brick => brick.sector_id === sector.id).map(brick => brick.id);
    console.log('Sector bricks:', sectorBricks);
    setSectorFormData({
      name: sector.name,
      selectedBricks: sectorBricks,
    });
    setSectorsDialogOpen(true);
  };

  const openCreateSectorDialog = () => {
    setEditingSector(null);
    setSectorFormData({ name: '', selectedBricks: [] });
    setSectorsDialogOpen(true);
  };

  const handleBrickSelection = (brickId: string, checked: boolean) => {
    console.log('Brick selection changed:', brickId, checked);
    setSectorFormData(prev => ({
      ...prev,
      selectedBricks: checked 
        ? [...prev.selectedBricks, brickId]
        : prev.selectedBricks.filter(id => id !== brickId)
    }));
  };

  const getSectorName = (brick: any) => {
    return brick.sectors?.name || 'N/A';
  };

  const getBricksCount = (sectorId: string) => {
    return bricks.filter(brick => brick.sector_id === sectorId).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Brick Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Sectors Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sectors List</CardTitle>
                <CardDescription>Manage sectors and their associated bricks</CardDescription>
              </div>
              <Dialog open={sectorsDialogOpen} onOpenChange={setSectorsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateSectorDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Sector</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSector ? 'Edit Sector' : 'New Sector'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSector 
                        ? 'Edit sector information and select associated bricks'
                        : 'Create a new sector and select associated bricks'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSectorSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sector-name">Sector name</Label>
                      <Input
                        id="sector-name"
                        value={sectorFormData.name}
                        onChange={(e) => setSectorFormData({ ...sectorFormData, name: e.target.value })}
                        placeholder="Ex: North"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Associated bricks</Label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {bricks.map((brick) => (
                          <div key={brick.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brick-${brick.id}`}
                              checked={sectorFormData.selectedBricks.includes(brick.id)}
                              onCheckedChange={(checked) => handleBrickSelection(brick.id, checked as boolean)}
                            />
                            <Label htmlFor={`brick-${brick.id}`} className="text-sm">
                              {brick.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setSectorsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Number of bricks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectors.map((sector) => (
                    <TableRow key={sector.id}>
                      <TableCell className="font-medium">
                        {sector.name}
                      </TableCell>
                      <TableCell>{getBricksCount(sector.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditSectorDialog(sector)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSectorDelete(sector)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bricks Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bricks List</CardTitle>
                <CardDescription>Manage geographical zones</CardDescription>
              </div>
              <Dialog open={bricksDialogOpen} onOpenChange={setBricksDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateBrickDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Brick</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBrick ? 'Edit Brick' : 'New Brick'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingBrick 
                        ? 'Edit brick information'
                        : 'Create a new geographical brick'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBrickSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Brick name</Label>
                      <Input
                        id="name"
                        value={brickFormData.name}
                        onChange={(e) => setBrickFormData({ ...brickFormData, name: e.target.value })}
                        placeholder="Ex: North-1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Select
                        value={brickFormData.sector_id}
                        onValueChange={(value) => setBrickFormData({ ...brickFormData, sector_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={brickFormData.description}
                        onChange={(e) => setBrickFormData({ ...brickFormData, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setBricksDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bricks.map((brick) => (
                    <TableRow key={brick.id}>
                      <TableCell className="font-medium">{brick.name}</TableCell>
                      <TableCell>{getSectorName(brick)}</TableCell>
                      <TableCell>{brick.description || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditBrickDialog(brick)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBrickDelete(brick)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BricksManager;
