
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

type Territory = Database['public']['Tables']['territories']['Row'];
type Sector = Database['public']['Tables']['sectors']['Row'];

interface BricksManagerProps {
  onBack: () => void;
}

const BricksManager: React.FC<BricksManagerProps> = ({ onBack }) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states for territories
  const [territoriesDialogOpen, setTerritoriesDialogOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [territoryFormData, setTerritoryFormData] = useState({
    name: '',
    description: '',
    sector_id: '',
  });

  // Dialog states for sectors
  const [sectorsDialogOpen, setSectorsDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    selectedTerritories: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('Starting fetchData...');
    try {
      setLoading(true);
      
      // Fetch territories with sector information
      const { data: territoriesData, error: territoriesError } = await supabase
        .from('territories')
        .select(`
          *,
          sectors:sector_id (
            id,
            name
          )
        `)
        .order('name', { ascending: true });

      if (territoriesError) {
        console.error('Error fetching territories:', territoriesError);
        throw territoriesError;
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

      console.log('Fetched territories:', territoriesData);
      console.log('Fetched sectors:', sectorsData);

      setTerritories(territoriesData || []);
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

  // Territory CRUD operations
  const handleTerritorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!territoryFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Territory name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: territoryFormData.name.trim(),
        description: territoryFormData.description.trim() || null,
        sector_id: territoryFormData.sector_id || null,
      };

      if (editingTerritory) {
        const { error } = await supabase
          .from('territories')
          .update(submitData)
          .eq('id', editingTerritory.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Territory updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('territories')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Territory created successfully",
        });
      }

      setTerritoriesDialogOpen(false);
      setEditingTerritory(null);
      setTerritoryFormData({ name: '', description: '', sector_id: '' });
      await fetchData();
    } catch (error) {
      console.error('Error saving territory:', error);
      toast({
        title: "Error",
        description: "Unable to save territory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTerritoryDelete = async (territory: Territory) => {
    if (confirm(`Are you sure you want to delete the territory "${territory.name}"?`)) {
      try {
        const { error } = await supabase
          .from('territories')
          .delete()
          .eq('id', territory.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Territory deleted successfully",
        });
        await fetchData();
      } catch (error) {
        console.error('Error deleting territory:', error);
        toast({
          title: "Error",
          description: "Unable to delete territory",
          variant: "destructive",
        });
      }
    }
  };

  const openEditTerritoryDialog = (territory: Territory) => {
    setEditingTerritory(territory);
    setTerritoryFormData({
      name: territory.name,
      description: territory.description || '',
      sector_id: territory.sector_id || '',
    });
    setTerritoriesDialogOpen(true);
  };

  const openCreateTerritoryDialog = () => {
    setEditingTerritory(null);
    setTerritoryFormData({ name: '', description: '', sector_id: '' });
    setTerritoriesDialogOpen(true);
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

      // Handle territory assignments
      console.log('Updating territory assignments for sector:', sectorId);
      console.log('Selected territories:', sectorFormData.selectedTerritories);

      // Get current territory assignments for this sector
      const currentTerritories = territories.filter(territory => territory.sector_id === sectorId).map(territory => territory.id);
      console.log('Current territories for sector:', currentTerritories);

      // Find territories to unassign (currently assigned but not selected)
      const territoriesToUnassign = currentTerritories.filter(territoryId => !sectorFormData.selectedTerritories.includes(territoryId));
      
      // Find territories to assign (selected but not currently assigned)
      const territoriesToAssign = sectorFormData.selectedTerritories.filter(territoryId => !currentTerritories.includes(territoryId));

      console.log('Territories to unassign:', territoriesToUnassign);
      console.log('Territories to assign:', territoriesToAssign);

      // Unassign territories that should no longer be in this sector
      if (territoriesToUnassign.length > 0) {
        const { error: unassignError } = await supabase
          .from('territories')
          .update({ sector_id: null })
          .in('id', territoriesToUnassign);

        if (unassignError) {
          console.error('Error unassigning territories:', unassignError);
          throw unassignError;
        }
      }

      // Assign new territories to this sector
      if (territoriesToAssign.length > 0) {
        const { error: assignError } = await supabase
          .from('territories')
          .update({ sector_id: sectorId })
          .in('id', territoriesToAssign);

        if (assignError) {
          console.error('Error assigning territories:', assignError);
          throw assignError;
        }
      }

      // Close dialog and reset form
      setSectorsDialogOpen(false);
      setEditingSector(null);
      setSectorFormData({ name: '', selectedTerritories: [] });
      
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
        // First, update territories to remove sector reference
        await supabase
          .from('territories')
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
    const sectorTerritories = territories.filter(territory => territory.sector_id === sector.id).map(territory => territory.id);
    console.log('Sector territories:', sectorTerritories);
    setSectorFormData({
      name: sector.name,
      selectedTerritories: sectorTerritories,
    });
    setSectorsDialogOpen(true);
  };

  const openCreateSectorDialog = () => {
    setEditingSector(null);
    setSectorFormData({ name: '', selectedTerritories: [] });
    setSectorsDialogOpen(true);
  };

  const handleTerritorySelection = (territoryId: string, checked: boolean) => {
    console.log('Territory selection changed:', territoryId, checked);
    setSectorFormData(prev => ({
      ...prev,
      selectedTerritories: checked 
        ? [...prev.selectedTerritories, territoryId]
        : prev.selectedTerritories.filter(id => id !== territoryId)
    }));
  };

  const getSectorName = (territory: any) => {
    return territory.sectors?.name || 'N/A';
  };

  const getTerritoriesCount = (sectorId: string) => {
    return territories.filter(territory => territory.sector_id === sectorId).length;
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
            <h1 className="text-2xl font-bold text-gray-900">Territory Management</h1>
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
                <CardDescription>Manage sectors and their associated territories</CardDescription>
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
                        ? 'Edit sector information and select associated territories'
                        : 'Create a new sector and select associated territories'}
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
                      <Label>Associated territories</Label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {territories.map((territory) => (
                          <div key={territory.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`territory-${territory.id}`}
                              checked={sectorFormData.selectedTerritories.includes(territory.id)}
                              onCheckedChange={(checked) => handleTerritorySelection(territory.id, checked as boolean)}
                            />
                            <Label htmlFor={`territory-${territory.id}`} className="text-sm">
                              {territory.name}
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
                    <TableHead>Number of territories</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectors.map((sector) => (
                    <TableRow key={sector.id}>
                      <TableCell className="font-medium">
                        {sector.name}
                      </TableCell>
                      <TableCell>{getTerritoriesCount(sector.id)}</TableCell>
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

        {/* Territories Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Territories List</CardTitle>
                <CardDescription>Manage geographical zones</CardDescription>
              </div>
              <Dialog open={territoriesDialogOpen} onOpenChange={setTerritoriesDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateTerritoryDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Territory</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTerritory ? 'Edit Territory' : 'New Territory'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTerritory 
                        ? 'Edit territory information'
                        : 'Create a new geographical territory'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleTerritorySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Territory name</Label>
                      <Input
                        id="name"
                        value={territoryFormData.name}
                        onChange={(e) => setTerritoryFormData({ ...territoryFormData, name: e.target.value })}
                        placeholder="Ex: North-1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Select
                        value={territoryFormData.sector_id}
                        onValueChange={(value) => setTerritoryFormData({ ...territoryFormData, sector_id: value })}
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
                        value={territoryFormData.description}
                        onChange={(e) => setTerritoryFormData({ ...territoryFormData, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setTerritoriesDialogOpen(false)}>
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
                  {territories.map((territory) => (
                    <TableRow key={territory.id}>
                      <TableCell className="font-medium">{territory.name}</TableCell>
                      <TableCell>{getSectorName(territory)}</TableCell>
                      <TableCell>{territory.description || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditTerritoryDialog(territory)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTerritoryDelete(territory)}
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
