import { supabase } from './supabase';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'developer' | 'admin' | 'agent' | 'customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Profile[];
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error as Error | null };
}

export async function inviteUser(email: string, role: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role },
  });
  return { error: error as Error | null };
}

export async function deactivateUser(id: string): Promise<{ error: Error | null }> {
  return updateProfile(id, { is_active: false });
}
