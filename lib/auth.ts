import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export async function requireAdmin(): Promise<{ user: User; supabase: Awaited<ReturnType<typeof createClient>> } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autorizado.' };
  if (user.app_metadata?.role !== 'admin') return { error: 'Não autorizado.' };
  return { user, supabase };
}
