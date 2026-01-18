'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient, createDataClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth용 클라이언트 (세션 관리)
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // 데이터 쿼리용 클라이언트 (navigator.locks 우회)
  const dataClientRef = useRef(createDataClient());
  const dataClient = dataClientRef.current;

  // 프로필 조회 또는 생성 (dataClient 사용 - navigator.locks 우회)
  const fetchProfile = useCallback(async (
    userId: string,
    userEmail?: string,
    userName?: string
  ): Promise<Profile | null> => {
    console.log('[Auth] fetchProfile start:', userId);
    try {
      // 먼저 프로필 조회 시도 (dataClient 사용)
      console.log('[Auth] Querying profiles table...');
      const { data, error } = await dataClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('[Auth] Query result:', { data: !!data, error: error?.message });

      if (error) {
        console.error('[Auth] Error fetching profile:', error);
        return null;
      }

      // 프로필이 있으면 반환
      if (data) {
        console.log('[Auth] Profile found:', data.email);
        return data as Profile;
      }

      // 프로필이 없으면 생성 시도 (dataClient 사용)
      console.log('[Auth] Profile not found, creating...');
      const { data: newProfile, error: insertError } = await dataClient
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail || '',
          name: userName || userEmail?.split('@')[0] || 'User',
          role: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Auth] Error creating profile:', insertError);
        return null;
      }

      console.log('[Auth] Profile created:', newProfile?.email);
      return newProfile as Profile;
    } catch (err) {
      console.error('[Auth] fetchProfile exception:', err);
      return null;
    }
  }, [dataClient]);

  // 프로필 새로고침
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // 세션과 프로필 업데이트 헬퍼
  const updateAuthState = useCallback(async (newSession: Session | null) => {
    console.log('[Auth] updateAuthState:', newSession ? 'has session' : 'no session');
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      const { id, email, user_metadata } = newSession.user;
      const userName = user_metadata?.full_name || user_metadata?.name || email?.split('@')[0];
      console.log('[Auth] Fetching profile for:', id);
      const profileData = await fetchProfile(id, email || '', userName);
      console.log('[Auth] Profile fetched:', profileData?.email || 'null');
      setProfile(profileData);
    } else {
      setProfile(null);
    }
    console.log('[Auth] updateAuthState complete');
  }, [fetchProfile]);

  // 초기화 및 세션 변경 감지 (정석 패턴)
  useEffect(() => {
    let mounted = true;

    // onAuthStateChange는 구독 시 INITIAL_SESSION 이벤트를 발생시킴
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] onAuthStateChange:', event);

        if (!mounted) return;

        try {
          await updateAuthState(newSession);
        } catch (err) {
          console.error('[Auth] updateAuthState error:', err);
        } finally {
          if (mounted) {
            console.log('[Auth] Setting loading to false');
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, updateAuthState]);

  // 이메일 로그인
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  // 이메일 회원가입
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { error: error as Error | null };
  };

  // Google 로그인
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // AbortError는 무시
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('[Auth] Sign out error:', error);
      }
    }
    // 상태 초기화 후 리다이렉트
    setUser(null);
    setProfile(null);
    setSession(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
