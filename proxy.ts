import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';

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
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => headersToSet.push([key, value]));
          }
        },
      },
    }
  );

  let user = null;
  try {
    ({ data: { user } } = await supabase.auth.getUser());
  } catch (e) {
    console.error('[proxy] getUser failed:', e);
  }

  const applyCookiesAndHeaders = (res: NextResponse) => {
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    headersToSet.forEach(([key, value]) => res.headers.set(key, value));
    return res;
  };

  if (isLoginPage && user) {
    return applyCookiesAndHeaders(NextResponse.redirect(new URL('/admin/dashboard', request.url)));
  }

  if (!isLoginPage && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return applyCookiesAndHeaders(NextResponse.redirect(loginUrl));
  }

  return applyCookiesAndHeaders(NextResponse.next({ request }));
}

export const config = {
  matcher: ['/admin/:path*'],
};
