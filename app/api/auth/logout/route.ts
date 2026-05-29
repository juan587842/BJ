import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  return response;
}
