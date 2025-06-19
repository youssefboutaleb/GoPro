
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client to manage users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting bulk user creation...');

    // Define all users with their roles
    const usersToCreate = [
      // Sales Directors
      { email: 'director1@sales.com', password: '123456', role: 'Sales Director', firstName: 'Director', lastName: 'One' },
      { email: 'director2@sales.com', password: '123456', role: 'Sales Director', firstName: 'Director', lastName: 'Two' },
      
      // Supervisors
      { email: 'supervisor1@sup.com', password: '123456', role: 'Supervisor', firstName: 'Supervisor', lastName: 'One' },
      { email: 'supervisor2@sup.com', password: '123456', role: 'Supervisor', firstName: 'Supervisor', lastName: 'Two' },
      { email: 'supervisor3@sup.com', password: '123456', role: 'Supervisor', firstName: 'Supervisor', lastName: 'Three' },
      { email: 'supervisor4@sup.com', password: '123456', role: 'Supervisor', firstName: 'Supervisor', lastName: 'Four' },
      
      // Delegates
      { email: 'delegate1@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'One' },
      { email: 'delegate2@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Two' },
      { email: 'delegate3@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Three' },
      { email: 'delegate4@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Four' },
      { email: 'delegate5@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Five' },
      { email: 'delegate6@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Six' },
      { email: 'delegate7@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Seven' },
      { email: 'delegate8@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Eight' },
      { email: 'delegate9@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Nine' },
      { email: 'delegate10@dlg.com', password: '123456', role: 'Delegate', firstName: 'Delegate', lastName: 'Ten' },
    ];

    const createdUsers: any[] = [];

    // Step 1: Create all auth users
    console.log('Creating auth users...');
    for (const user of usersToCreate) {
      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName
          }
        });

        if (authError) {
          console.error(`Error creating user ${user.email}:`, authError);
          continue;
        }

        console.log(`Created auth user: ${user.email}`);
        createdUsers.push({
          ...user,
          id: authUser.user.id
        });
      } catch (error) {
        console.error(`Exception creating user ${user.email}:`, error);
      }
    }

    // Wait a bit for triggers to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Update profiles with correct roles
    console.log('Updating profile roles...');
    for (const user of createdUsers) {
      try {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            role: user.role,
            first_name: user.firstName,
            last_name: user.lastName
          })
          .eq('id', user.id);

        if (profileError) {
          console.error(`Error updating profile for ${user.email}:`, profileError);
        } else {
          console.log(`Updated profile role for ${user.email}: ${user.role}`);
        }
      } catch (error) {
        console.error(`Exception updating profile for ${user.email}:`, error);
      }
    }

    // Step 3: Set up supervisor hierarchy
    console.log('Setting up supervisor hierarchy...');
    
    // Find users by email for hierarchy setup
    const findUserByEmail = (email: string) => createdUsers.find(u => u.email === email);
    
    const hierarchyUpdates = [
      // Supervisors under Directors
      { subordinate: 'supervisor1@sup.com', supervisor: 'director1@sales.com' },
      { subordinate: 'supervisor2@sup.com', supervisor: 'director1@sales.com' },
      { subordinate: 'supervisor3@sup.com', supervisor: 'director2@sales.com' },
      { subordinate: 'supervisor4@sup.com', supervisor: 'director2@sales.com' },
      
      // Delegates under Supervisors
      { subordinate: 'delegate1@dlg.com', supervisor: 'supervisor1@sup.com' },
      { subordinate: 'delegate2@dlg.com', supervisor: 'supervisor1@sup.com' },
      { subordinate: 'delegate3@dlg.com', supervisor: 'supervisor1@sup.com' },
      { subordinate: 'delegate4@dlg.com', supervisor: 'supervisor2@sup.com' },
      { subordinate: 'delegate5@dlg.com', supervisor: 'supervisor2@sup.com' },
      { subordinate: 'delegate6@dlg.com', supervisor: 'supervisor2@sup.com' },
      { subordinate: 'delegate7@dlg.com', supervisor: 'supervisor3@sup.com' },
      { subordinate: 'delegate8@dlg.com', supervisor: 'supervisor3@sup.com' },
      { subordinate: 'delegate9@dlg.com', supervisor: 'supervisor4@sup.com' },
      { subordinate: 'delegate10@dlg.com', supervisor: 'supervisor4@sup.com' },
    ];

    for (const hierarchy of hierarchyUpdates) {
      const subordinateUser = findUserByEmail(hierarchy.subordinate);
      const supervisorUser = findUserByEmail(hierarchy.supervisor);
      
      if (subordinateUser && supervisorUser) {
        try {
          const { error: hierarchyError } = await supabaseAdmin
            .from('profiles')
            .update({ supervisor_id: supervisorUser.id })
            .eq('id', subordinateUser.id);

          if (hierarchyError) {
            console.error(`Error setting supervisor for ${hierarchy.subordinate}:`, hierarchyError);
          } else {
            console.log(`Set ${hierarchy.supervisor} as supervisor for ${hierarchy.subordinate}`);
          }
        } catch (error) {
          console.error(`Exception setting hierarchy for ${hierarchy.subordinate}:`, error);
        }
      }
    }

    // Step 4: Verify the setup
    console.log('Verifying setup...');
    const { data: profiles, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, role, supervisor_id')
      .in('id', createdUsers.map(u => u.id));

    if (verifyError) {
      console.error('Error verifying setup:', verifyError);
    } else {
      console.log('Created profiles:', profiles);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully created ${createdUsers.length} users with proper roles and hierarchy`,
        createdUsers: createdUsers.length,
        profiles: profiles
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
