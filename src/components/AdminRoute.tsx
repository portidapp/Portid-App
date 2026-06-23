import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isAdminState, setIsAdminState] = useState<{ checkedUserId: string | null; isAdmin: boolean }>({
    checkedUserId: null,
    isAdmin: false
  });

  const isChecking = loading || (user && isAdminState.checkedUserId !== user.id);

  console.log("[AdminRoute] render. user:", user?.id, "loading:", loading, "isChecking:", isChecking, "isAdmin:", isAdminState.isAdmin);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        console.log("[AdminRoute] No user found, setting isAdmin = false");
        setIsAdminState({ checkedUserId: null, isAdmin: false });
        return;
      }
      try {
        console.log("[AdminRoute] Checking admin role for user:", user.id);
        const checkPromise = supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
        
        const response = await Promise.race([checkPromise, timeoutPromise]) as { data: boolean | null; error: any };
        console.log("[AdminRoute] has_role response:", response);
        if (response.error) {
          console.error("[AdminRoute] has_role RPC returned error:", response.error);
        }
        setIsAdminState({ checkedUserId: user.id, isAdmin: !!response.data });
      } catch (err) {
        console.error("[AdminRoute] Admin check failed with exception:", err);
        setIsAdminState({ checkedUserId: user.id, isAdmin: false });
      }
    };
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin-login" replace />;
  if (!isAdminState.isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default AdminRoute;
