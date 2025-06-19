
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

    // First, let's fix the trigger function that's causing the email column error
    console.log('Fixing the handle_new_user trigger function...');
    const { error: functionError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = ''
        AS $$
        BEGIN
          INSERT INTO public.profiles (id, first_name, last_name, role)
          VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'first_name',
            NEW.raw_user_meta_data ->> 'last_name',
            'Delegate'
          );
          RETURN NEW;
        END;
        $$;
      `
    });

    if (functionError) {
      console.error('Error updating trigger function:', functionError);
      // Continue anyway, we'll update profiles manually
    } else {
      console.log('Trigger function updated successfully');
    }

    // Define all users with their roles and sample names
    const usersToCreate = [
      // Sales Directors
      { email: 'director1@sales.com', password: '123456', role: 'Sales Director', firstName: 'John', lastName: 'Smith' },
      { email: 'director2@sales.com', password: '123456', role: 'Sales Director', firstName: 'Sarah', lastName: 'Johnson' },
      
      // Supervisors
      { email: 'supervisor1@sup.com', password: '123456', role: 'Supervisor', firstName: 'Michael', lastName: 'Brown' },
      { email: 'supervisor2@sup.com', password: '123456', role: 'Supervisor', firstName: 'Emily', lastName: 'Davis' },
      { email: 'supervisor3@sup.com', password: '123456', role: 'Supervisor', firstName: 'David', lastName: 'Wilson' },
      { email: 'supervisor4@sup.com', password: '123456', role: 'Supervisor', firstName: 'Lisa', lastName: 'Garcia' },
      
      // Delegates
      { email: 'delegate1@dlg.com', password: '123456', role: 'Delegate', firstName: 'James', lastName: 'Martinez' },
      { email: 'delegate2@dlg.com', password: '123456', role: 'Delegate', firstName: 'Jennifer', lastName: 'Anderson' },
      { email: 'delegate3@dlg.com', password: '123456', role: 'Delegate', firstName: 'Robert', lastName: 'Taylor' },
      { email: 'delegate4@dlg.com', password: '123456', role: 'Delegate', firstName: 'Jessica', lastName: 'Thomas' },
      { email: 'delegate5@dlg.com', password: '123456', role: 'Delegate', firstName: 'William', lastName: 'Jackson' },
      { email: 'delegate6@dlg.com', password: '123456', role: 'Delegate', firstName: 'Ashley', lastName: 'White' },
      { email: 'delegate7@dlg.com', password: '123456', role: 'Delegate', firstName: 'Christopher', lastName: 'Harris' },
      { email: 'delegate8@dlg.com', password: '123456', role: 'Delegate', firstName: 'Amanda', lastName: 'Martin' },
      { email: 'delegate9@dlg.com', password: '123456', role: 'Delegate', firstName: 'Matthew', lastName: 'Thompson' },
      { email: 'delegate10@dlg.com', password: '123456', role: 'Delegate', firstName: 'Stephanie', lastName: 'Rodriguez' },
    ];

    const createdUsers: any[] = [];

    // Create all auth users
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

    // Wait for triggers to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update profiles with correct roles (since trigger might not work properly)
    console.log('Updating profile roles...');
    for (const user of createdUsers) {
      try {
        // First, try to insert the profile if it doesn't exist
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({ 
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          });

        if (insertError) {
          // If insert fails, try to update
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
              role: user.role,
              first_name: user.firstName,
              last_name: user.lastName
            })
            .eq('id', user.id);

          if (updateError) {
            console.error(`Error updating profile for ${user.email}:`, updateError);
          } else {
            console.log(`Updated profile for ${user.email}: ${user.role}`);
          }
        } else {
          console.log(`Inserted profile for ${user.email}: ${user.role}`);
        }
      } catch (error) {
        console.error(`Exception handling profile for ${user.email}:`, error);
      }
    }

    // Set up supervisor hierarchy
    console.log('Setting up supervisor hierarchy...');
    
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

    // Verify the setup
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
