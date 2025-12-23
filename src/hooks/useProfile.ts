import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      updates 
    }: { 
      userId: string; 
      updates: { full_name?: string; avatar_url?: string } 
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });
}
