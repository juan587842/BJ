import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';

  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    }
  );

  let user = null;
  try {
    ({ data: { user } } = await supabase.auth.getUser());
  } catch {}

  if (isLoginPage && user) {
    const res = NextResponse.redirect(new URL('/admin/dashboard', request.url));
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  }

  if (!isLoginPage && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  }

  const res = NextResponse.next({ request });
  cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  return res;
}

export const config = {
  matcher: [
    '/admin/login',
    '/admin/dashboard',
    '/admin/caixa',
    '/admin/pedidos',
    '/admin/impressoes',
    '/admin/estoque',
    '/admin/comissionados',
    '/admin/comissionados/:path*',
    '/admin/fornecedores',
    '/admin/categorias',
    '/admin/historico',
    '/admin/relatorios',
    '/admin/curriculo',
    '/admin/configuracoes',
  ],
};
