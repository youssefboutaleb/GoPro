
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, FileText, Users, Package, Stethoscope } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from './MultiSelect';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfilesForActionPlans } from '@/hooks/useProfilesForActionPlans';

interface ActionPlanFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ActionPlanFormFields = ({ form }: ActionPlanFormFieldsProps) => {
  const { t } = useTranslation();
  
  const { data: profilesData } = useProfilesForActionPlans();
  
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: bricks } = useQuery({
    queryKey: ['bricks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bricks')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
        .order('last_name');
      
      if (error) throw error;
      return data;
    },
  });

  const actionTypes = [
    { value: 'Staff', label: 'Staff' },
    { value: 'ePU', label: 'ePU' },
    { value: 'Congress', label: 'Congress' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Gift', label: 'Gift' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('common.type')}
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectType')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {actionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('common.date')}
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('common.location')}
            </FormLabel>
            <FormControl>
              <Input placeholder={t('common.enterLocation')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.description')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('common.enterDescription')} 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {profilesData?.delegates && profilesData.delegates.length > 0 && (
        <FormField
          control={form.control}
          name="targeted_delegates"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('common.targetedDelegates')}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={profilesData.delegates.map(d => ({
                    value: d.id,
                    label: `${d.first_name} ${d.last_name}`
                  }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('common.selectDelegates')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {profilesData?.supervisors && profilesData.supervisors.length > 0 && (
        <FormField
          control={form.control}
          name="targeted_supervisors"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('common.targetedSupervisors')}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={profilesData.supervisors.map(s => ({
                    value: s.id,
                    label: `${s.first_name} ${s.last_name}`
                  }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('common.selectSupervisors')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {profilesData?.salesDirectors && profilesData.salesDirectors.length > 0 && (
        <FormField
          control={form.control}
          name="targeted_sales_directors"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('common.targetedSalesDirectors')}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={profilesData.salesDirectors.map(sd => ({
                    value: sd.id,
                    label: `${sd.first_name} ${sd.last_name}`
                  }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('common.selectSalesDirectors')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {products && products.length > 0 && (
        <FormField
          control={form.control}
          name="targeted_products"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('common.targetedProducts')}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={products.map(p => ({ value: p.id, label: p.name }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('common.selectProducts')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {bricks && bricks.length > 0 && (
        <FormField
          control={form.control}
          name="targeted_bricks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('common.targetedBricks')}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={bricks.map(b => ({ value: b.id, label: b.name }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('common.selectBricks')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {doctors && doctors.length > 0 && (
        <FormField
          control={form.control}
          name="targeted_doctors"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                {t('common.targetedDoctors')}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={doctors.map(d => ({
                    value: d.id,
                    label: `${d.first_name} ${d.last_name}`
                  }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder={t('common.selectDoctors')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
