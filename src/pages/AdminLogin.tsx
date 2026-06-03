import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: authData.user.id,
      _role: 'admin',
    });

    if (!isAdmin) {
      await supabase.auth.signOut();
      toast.error('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    toast.success('Welcome, Admin');
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 border-0 hover:opacity-90 transition-all" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="text-accent hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
