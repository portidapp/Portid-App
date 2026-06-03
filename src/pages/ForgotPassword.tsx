import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="font-heading text-2xl font-bold">
          <img src="/portid-logo.png" alt="Portid" className="h-[70px] mx-auto object-contain scale-[1.5] origin-center -mb-2" />
        </Link>
        <h1 className="mt-6 font-heading text-2xl font-bold">Reset password</h1>
        {sent ? (
          <div className="mt-6">
            <p className="text-muted-foreground">Check your email for a reset link.</p>
            <Link to="/login">
              <Button variant="outline" className="mt-4">Back to login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 border-0 hover:opacity-90 transition-all" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/login" className="text-accent hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
