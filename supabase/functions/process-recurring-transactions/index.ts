import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active recurring transactions that are due
    const now = new Date();
    const { data: recurringTransactions, error: fetchError } = await supabaseClient
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_occurrence', now.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${recurringTransactions?.length || 0} recurring transactions to process`);

    const createdTransactions = [];
    const updatedRecurring = [];

    for (const recurring of recurringTransactions || []) {
      // Create the transaction
      const { data: transaction, error: createError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: recurring.user_id,
          account_id: recurring.account_id,
          description: recurring.description,
          amount: recurring.amount,
          transaction_type: recurring.transaction_type,
          transaction_date: recurring.next_occurrence,
          notes: recurring.notes,
          recurring_transaction_id: recurring.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating transaction:', createError);
        continue;
      }

      createdTransactions.push(transaction);

      // Calculate next occurrence
      let nextOccurrence = new Date(recurring.next_occurrence);
      
      if (recurring.frequency_type === 'DAILY') {
        nextOccurrence.setDate(nextOccurrence.getDate() + recurring.frequency_value);
      } else if (recurring.frequency_type === 'WEEKLY') {
        nextOccurrence.setDate(nextOccurrence.getDate() + (7 * recurring.frequency_value));
      } else if (recurring.frequency_type === 'MONTHLY') {
        nextOccurrence.setMonth(nextOccurrence.getMonth() + recurring.frequency_value);
      }

      // Check if we should deactivate this recurring transaction
      let shouldDeactivate = false;
      if (recurring.end_type === 'UNTIL_DATE' && recurring.end_date) {
        const endDate = new Date(recurring.end_date);
        if (nextOccurrence > endDate) {
          shouldDeactivate = true;
        }
      }

      // Update the recurring transaction
      const { error: updateError } = await supabaseClient
        .from('recurring_transactions')
        .update({
          next_occurrence: nextOccurrence.toISOString(),
          is_active: !shouldDeactivate,
        })
        .eq('id', recurring.id);

      if (updateError) {
        console.error('Error updating recurring transaction:', updateError);
        continue;
      }

      updatedRecurring.push(recurring.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: createdTransactions.length,
        updated: updatedRecurring.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
