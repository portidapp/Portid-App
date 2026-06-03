import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      try {
        const checkPromise = supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
        
        const response = await Promise.race([checkPromise, timeoutPromise]) as { data: boolean | null };
        setIsAdmin(!!response.data);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      }
    };
    if (!loading) checkAdmin();
  }, [user, loading]);

  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin-login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default AdminRoute;
