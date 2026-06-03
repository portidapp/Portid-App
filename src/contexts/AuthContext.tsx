import { useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, AuthContextType } from './AuthContextTypes';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [planTier, setPlanTier] = useState<AuthContextType['planTier']>(() => {
    const cached = localStorage.getItem('portid_plan_tier');
    return (cached as AuthContextType['planTier']) || 'basic';
  });
  const [loading, setLoading] = useState(true);

  const fetchUserPlan = async (userId: string) => {
    console.log("[Auth] Fetching plan for user:", userId);
    try {
      const planPromise = supabase
        .from('user_plans')
        .select('plan_tier, expires_at')
        .eq('user_id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Plan fetch timeout')), 3000)
      );

      const response = await Promise.race([planPromise, timeoutPromise]) as any;
      const data = response?.data;
      
      if (data?.plan_tier) {
        const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
        const isExpired = expiresAt && expiresAt < new Date();
        const tier = isExpired ? 'basic' : (data.plan_tier.toLowerCase() as AuthContextType['planTier']);
        
        console.log("[Auth] Plan fetched successfully:", tier, isExpired ? "(Subscription Expired)" : "");
        setPlanTier(tier);
        localStorage.setItem('portid_plan_tier', tier);
      } else {
        console.log("[Auth] No plan found, defaulting to free");
        setPlanTier('basic');
        localStorage.setItem('portid_plan_tier', 'basic');
      }
    } catch (err) {
      console.error("[Auth] Error fetching plan:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("[Auth] Initializing AuthProvider...");

    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("[Auth] SAFETY TIMEOUT - Releasing loading state.");
        setLoading(false);
      }
    }, 5000);

    const initialize = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Don't await this to avoid blocking the initial mount
          fetchUserPlan(currentSession.user.id);
        } else {
          localStorage.removeItem('portid_plan_tier');
        }
      } catch (err) {
        console.error("[Auth] Initialization error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        fetchUserPlan(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setPlanTier('basic');
        localStorage.removeItem('portid_plan_tier');
      }
      
      setLoading(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPlanTier('basic');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };
  
  const verifyOtp = async (email: string, token: string, type: 'signup' | 'recovery' | 'magiclink' | 'email_change') => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    return { error: error as Error | null };
  };

  const resendOtp = async (email: string, type: 'signup' | 'recovery' | 'email_change') => {
    const { error } = await supabase.auth.resend({
      type,
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, planTier, signUp, signIn, signInWithGoogle, signOut, resetPassword, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
};
