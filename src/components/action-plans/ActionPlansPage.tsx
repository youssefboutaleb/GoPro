
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionPlansList } from './ActionPlansList';
import { ActionPlanDialog } from './ActionPlanDialog';
import { useAuth } from '@/hooks/useAuth';

export const ActionPlansPage = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const canCreateActionPlans = profile?.role === 'Admin' || 
                              profile?.role === 'Sales Director' || 
                              profile?.role === 'Supervisor' ||
                              profile?.role === 'Marketing Manager';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {t('common.actionPlans')}
          </CardTitle>
          {canCreateActionPlans && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('common.create')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
              <TabsTrigger value="approved">{t('common.approved')}</TabsTrigger>
              <TabsTrigger value="rejected">{t('common.rejected')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <ActionPlansList />
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              <ActionPlansList statusFilter="Pending" />
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              <ActionPlansList statusFilter="Approved" />
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              <ActionPlansList statusFilter="Rejected" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ActionPlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};
