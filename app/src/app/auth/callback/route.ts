import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('[Callback] URL:', request.url);
  console.log('[Callback] Code:', code ? 'exists' : 'none');

  if (code) {
    // 먼저 Response 객체 생성 (쿠키를 여기에 설정)
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log('[Callback] Setting cookies:', cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('[Callback] Exchange result:', error ? error.message : 'success');

    if (!error) {
      return response;
    }
  }

  // 에러 시 로그인 페이지로 리다이렉트
  console.log('[Callback] Redirecting to login with error');
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
