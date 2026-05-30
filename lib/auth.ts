import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export async function requireAdmin(): Promise<{ user: User; supabase: Awaited<ReturnType<typeof createAdminClient>> } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autorizado.' };
  const adminClient = await createAdminClient();
  return { user, supabase: adminClient };
}
