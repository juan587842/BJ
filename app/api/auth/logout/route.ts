import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const headersToSet: [string, string][] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies, headers) {
          cookiesToSet.push(...cookies);
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => headersToSet.push([key, value]));
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL('/admin/login', request.url));

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  headersToSet.forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
