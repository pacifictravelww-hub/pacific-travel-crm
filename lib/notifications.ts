import { supabase } from './supabase';

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
};

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  data?: Record<string, unknown>
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
    data: data ?? null,
  });
}

export async function notifyAdmins(
  type: string,
  title: string,
  body?: string,
  data?: Record<string, unknown>
): Promise<void> {
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'developer']);
  if (!admins) return;
  await Promise.all(
    admins.map((admin: { id: string }) =>
      createNotification(admin.id, type, title, body, data)
    )
  );
}

export async function deleteNotification(id: string): Promise<void> {
  await supabase.from('notifications').delete().eq('id', id);
}
