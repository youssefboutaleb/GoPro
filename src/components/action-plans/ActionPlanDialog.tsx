
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ActionPlanFormFields } from './ActionPlanFormFields';
import { useActionPlans } from '@/hooks/useActionPlans';
import { useAuth } from '@/hooks/useAuth';

const actionPlanSchema = z.object({
  type: z.enum(['Staff', 'ePU', 'Congress', 'Travel', 'Gift']),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  targeted_delegates: z.array(z.string()).optional(),
  targeted_supervisors: z.array(z.string()).optional(),
  targeted_sales_directors: z.array(z.string()).optional(),
  targeted_products: z.array(z.string()).optional(),
  targeted_bricks: z.array(z.string()).optional(),
  targeted_doctors: z.array(z.string()).optional(),
});

type ActionPlanFormData = z.infer<typeof actionPlanSchema>;

interface ActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionPlan?: any;
}

export const ActionPlanDialog = ({ 
  open, 
  onOpenChange, 
  actionPlan 
}: ActionPlanDialogProps) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { createActionPlan, updateActionPlan } = useActionPlans();
  
  const form = useForm<ActionPlanFormData>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      type: 'Staff',
      date: '',
      location: '',
      description: '',
      targeted_delegates: [],
      targeted_supervisors: [],
      targeted_sales_directors: [],
      targeted_products: [],
      targeted_bricks: [],
      targeted_doctors: [],
      ...actionPlan,
    },
  });

  const onSubmit = async (data: ActionPlanFormData) => {
    console.log('🔄 Submitting action plan:', data);
    
    if (!profile?.id) {
      console.error('❌ No user profile available');
      return;
    }

    // Ensure required fields are present and properly typed
    const actionPlanData = {
      type: data.type,
      date: data.date, // This is required and guaranteed by schema
      location: data.location, // This is required and guaranteed by schema
      description: data.description || null,
      created_by: profile.id,
      // Convert empty arrays to null for database storage
      targeted_delegates: data.targeted_delegates?.length ? data.targeted_delegates : null,
      targeted_supervisors: data.targeted_supervisors?.length ? data.targeted_supervisors : null,
      targeted_sales_directors: data.targeted_sales_directors?.length ? data.targeted_sales_directors : null,
      targeted_products: data.targeted_products?.length ? data.targeted_products : null,
      targeted_bricks: data.targeted_bricks?.length ? data.targeted_bricks : null,
      targeted_doctors: data.targeted_doctors?.length ? data.targeted_doctors : null,
    };

    try {
      if (actionPlan?.id) {
        await updateActionPlan.mutateAsync({ 
          id: actionPlan.id, 
          ...actionPlanData 
        });
      } else {
        await createActionPlan.mutateAsync(actionPlanData);
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('❌ Error submitting action plan:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionPlan ? t('common.editActionPlan') : t('common.createActionPlan')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ActionPlanFormFields form={form} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={createActionPlan.isPending || updateActionPlan.isPending}
              >
                {createActionPlan.isPending || updateActionPlan.isPending
                  ? t('common.saving')
                  : actionPlan 
                    ? t('common.update') 
                    : t('common.create')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
