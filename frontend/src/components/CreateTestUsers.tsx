
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';

const CreateTestUsers = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTestUsers = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Calling create-test-users function...');
      
      const { data, error } = await supabase.functions.invoke('create-test-users');

      if (error) {
        console.error('Function error:', error);
        toast.error(`Error: ${error.message}`);
        return;
      }

      console.log('Function response:', data);
      setResult(data);
      
      if (data.success) {
        toast.success(`Successfully created ${data.createdUsers} test users!`);
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Exception calling function:', error);
      toast.error('Failed to create test users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Create Test Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create 16 test users with the following structure:
          </p>
          
          <div className="bg-gray-50 p-4 rounded text-sm">
            <div className="font-semibold mb-2">Users to be created:</div>
            <div className="space-y-1">
              <div>• 2 Sales Directors: director1@sales.com, director2@sales.com</div>
              <div>• 4 Supervisors: supervisor1-4@sup.com</div>
              <div>• 10 Delegates: delegate1-10@dlg.com</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              All passwords: 123456
            </div>
          </div>

          <Button 
            onClick={createTestUsers} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Users...
              </>
            ) : (
              'Create Test Users'
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="font-semibold mb-2">Result:</div>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTestUsers;
