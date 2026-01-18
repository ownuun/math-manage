'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default function DebugPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    console.log(msg);
    setResults(prev => [...prev, `${new Date().toISOString().slice(11,19)} - ${msg}`]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setLoading(true);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. 환경변수 확인
    log('=== 환경변수 확인 ===');
    log(`SUPABASE_URL: ${url ? url.slice(0, 30) + '...' : 'MISSING!'}`);
    log(`ANON_KEY: ${key ? key.slice(0, 20) + '...' : 'MISSING!'}`);

    // 2. Raw Fetch 테스트
    log('=== Raw Fetch 테스트 ===');
    try {
      const startTime = Date.now();
      const response = await fetch(`${url}/rest/v1/profiles?select=id,email,role&limit=3`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      });
      const elapsed = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        log(`✅ Raw Fetch 성공 (${elapsed}ms)`);
        log(`데이터: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        log(`❌ Raw Fetch 실패 (${elapsed}ms): ${response.status}`);
        log(`에러: ${errorText}`);
      }
    } catch (e) {
      log(`❌ Raw Fetch 예외: ${e}`);
    }

    // 3. Auth API 직접 테스트
    log('=== Auth API 직접 테스트 ===');
    try {
      const startTime = Date.now();
      const authResponse = await fetch(`${url}/auth/v1/`, {
        headers: {
          'apikey': key,
        },
      });
      const elapsed = Date.now() - startTime;
      log(`Auth API 응답: ${authResponse.status} (${elapsed}ms)`);
    } catch (e) {
      log(`❌ Auth API 예외: ${e}`);
    }

    // 4. persistSession: false로 테스트 (로컬 스토리지 우회)
    log('=== persistSession: false 테스트 ===');
    const supabaseNoPersist = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    });
    log('클라이언트 생성됨 (persistSession: false)');

    log('getSession 호출...');
    try {
      const startTime = Date.now();
      const { data: { session }, error: sessionError } = await supabaseNoPersist.auth.getSession();
      const elapsed = Date.now() - startTime;
      if (sessionError) {
        log(`getSession 에러 (${elapsed}ms): ${sessionError.message}`);
      } else if (session) {
        log(`✅ 세션 있음 (${elapsed}ms): ${session.user.email}`);
      } else {
        log(`✅ 세션 없음 (${elapsed}ms) - 정상 동작!`);
      }
    } catch (e) {
      log(`❌ getSession 예외: ${e}`);
    }

    log('프로필 쿼리 시작...');
    try {
      const startTime = Date.now();
      const { data, error } = await supabaseNoPersist
        .from('profiles')
        .select('id, email, role')
        .limit(3);

      const elapsed = Date.now() - startTime;

      if (error) {
        log(`❌ 쿼리 에러 (${elapsed}ms): ${error.message}`);
      } else {
        log(`✅ 쿼리 성공 (${elapsed}ms)`);
        log(`데이터: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (e) {
      log(`❌ 쿼리 예외: ${e}`);
    }

    // 5. 각 옵션별 테스트
    log('=== detectSessionInUrl만 false ===');
    const test1 = createSupabaseClient(url, key, {
      auth: { detectSessionInUrl: false }
    });
    try {
      const start = Date.now();
      const { data: { session } } = await test1.auth.getSession();
      log(`✅ 성공 (${Date.now() - start}ms): ${session ? session.user.email : '세션 없음'}`);
    } catch (e) {
      log(`❌ 실패: ${e}`);
    }

    log('=== autoRefreshToken만 false ===');
    const test2 = createSupabaseClient(url, key, {
      auth: { autoRefreshToken: false }
    });
    try {
      const start = Date.now();
      const { data: { session } } = await test2.auth.getSession();
      log(`✅ 성공 (${Date.now() - start}ms): ${session ? session.user.email : '세션 없음'}`);
    } catch (e) {
      log(`❌ 실패: ${e}`);
    }

    log('=== flowType: pkce 명시 ===');
    const test3 = createSupabaseClient(url, key, {
      auth: { flowType: 'pkce' }
    });
    try {
      const start = Date.now();
      const { data: { session } } = await test3.auth.getSession();
      log(`✅ 성공 (${Date.now() - start}ms): ${session ? session.user.email : '세션 없음'}`);
    } catch (e) {
      log(`❌ 실패: ${e}`);
    }

    log('=== 다른 storageKey 사용 ===');
    const test4 = createSupabaseClient(url, key, {
      auth: { storageKey: 'sb-test-' + Date.now() }
    });
    try {
      const start = Date.now();
      const { data: { session } } = await test4.auth.getSession();
      log(`✅ 성공 (${Date.now() - start}ms): ${session ? session.user.email : '세션 없음'}`);
    } catch (e) {
      log(`❌ 실패: ${e}`);
    }

    log('=== 진단 완료 ===');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 진단 페이지</h1>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-4"
      >
        {loading ? '진단 중...' : '진단 실행'}
      </button>

      <div className="bg-gray-800 p-4 rounded font-mono text-sm whitespace-pre-wrap">
        {results.length === 0 ? (
          <p className="text-gray-400">버튼을 클릭하여 진단을 시작하세요.</p>
        ) : (
          results.map((r, i) => (
            <div key={i} className={r.includes('⚠️') ? 'text-yellow-400' : r.includes('성공') ? 'text-green-400' : ''}>
              {r}
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h2 className="text-lg font-bold mb-2">RLS 무한재귀 문제 해결 방법:</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Supabase Dashboard &gt; SQL Editor 이동</li>
          <li>아래 SQL 실행:
            <pre className="bg-gray-700 p-2 mt-1 rounded text-xs overflow-x-auto">
{`-- 임시로 RLS 비활성화하여 테스트
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 또는 마이그레이션 파일 실행:
-- supabase/migrations/20260118_fix_rls_infinite_recursion.sql`}
            </pre>
          </li>
          <li>이 페이지에서 다시 진단 실행</li>
        </ol>
      </div>
    </div>
  );
}
