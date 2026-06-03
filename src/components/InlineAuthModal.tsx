import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, MailCheck, ArrowLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { User } from '@supabase/supabase-js';

type AuthStep = 'email' | 'login' | 'signup' | 'otp';

interface InlineAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const InlineAuthModal = ({ isOpen, onClose, onAuthSuccess }: InlineAuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>('email');
  const [otpToken, setOtpToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const { signIn, signUp, signInWithGoogle, verifyOtp, resendOtp, user } = useAuth();

  // When user becomes available (after auth), trigger success
  useEffect(() => {
    if (user && isOpen) {
      onAuthSuccess(user);
    }
  }, [user, isOpen, onAuthSuccess]);

  // Timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('email');
      setPassword('');
      setConfirmPassword('');
      setOtpToken('');
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [isOpen]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;

  const handleEmailNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // Check if user exists by attempting a sign-in with dummy password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'DUMMY_PASSWORD_CHECK_123',
      });

      const errorMsg = error?.message?.toLowerCase() || '';
      const status = (error as any)?.status;

      if (errorMsg.includes('email not confirmed')) {
        // User exists but email not confirmed
        setStep('login');
      } else if (errorMsg.includes('invalid login credentials')) {
        // User likely exists (credentials wrong) — show login
        setStep('login');
      } else if (status === 400) {
        // Other 400 error — might be new user
        setStep('signup');
      } else {
        // Default to login
        setStep('login');
      }
    } catch (err) {
      setStep('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      const isInvalid = error.message?.toLowerCase().includes('invalid login credentials');
      if (isInvalid) {
        toast.error("Invalid credentials. Try again or sign up.");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
    }
    // Success is handled by the useEffect watching `user`
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (strength < 50) {
      toast.error("Please choose a stronger password");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      const isDuplicate = error.message?.toLowerCase().includes('already registered') ||
        (error as any).status === 400;

      if (isDuplicate) {
        toast.info("You already have an account. Please sign in.");
        setStep('login');
        setPassword('');
        setConfirmPassword('');
        return;
      } else {
        toast.error(error.message);
      }
    } else {
      setStep('otp');
      setResendTimer(30);
    }
  };

  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpToken.length < 6) return;

    setLoading(true);
    const { error } = await verifyOtp(email, otpToken, 'signup');

    if (error) {
      toast.error(error.message);
      setLoading(false);
      setOtpToken('');
    }
    // Success is handled by the useEffect watching `user`
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    const { error } = await resendOtp(email, 'signup');
    setResending(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("New code sent to your email");
      setResendTimer(60);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    sessionStorage.setItem('auto_publish_pending', 'true');
    const timeout = setTimeout(() => setGoogleLoading(false), 8000);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
      clearTimeout(timeout);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 pt-8 pb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[length:64px_64px] opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)' }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Almost there!</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {step === 'email' && 'Sign up to publish'}
              {step === 'login' && 'Welcome back!'}
              {step === 'signup' && 'Create your account'}
              {step === 'otp' && 'Verify your email'}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              {step === 'email' && 'Your profile is ready. Just one more step.'}
              {step === 'login' && 'Sign in to publish your profile.'}
              {step === 'signup' && 'Set a password to secure your profile.'}
              {step === 'otp' && `We sent a 6-digit code to ${email}`}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* EMAIL STEP */}
            {step === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailNext}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="auth-email" className="text-sm font-bold text-zinc-700 ml-1">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 h-14 rounded-2xl font-bold text-lg hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                    <div className="flex items-center justify-center gap-2">
                      Continue <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-zinc-400">
                    <span className="bg-white px-4">Or</span>
                  </div>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full h-14 rounded-2xl border-zinc-200 bg-white text-zinc-700 font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all"
                >
                  {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Google
                </Button>
              </motion.form>
            )}

            {/* LOGIN STEP */}
            {step === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {/* Email pill */}
                <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <MailCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-zinc-700 truncate">{email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-xs font-bold text-orange-600 hover:underline px-2"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="auth-password" className="text-sm font-bold text-zinc-700">Password</Label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-zinc-400 hover:text-orange-500 transition-colors" onClick={onClose}>
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 h-14 rounded-2xl font-bold text-lg hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Sign In & Publish'}
                </Button>

                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('signup'); setPassword(''); }}
                    className="text-sm font-bold text-zinc-500 hover:text-orange-600 transition-colors"
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Go back
                  </button>
                </div>
              </motion.form>
            )}

            {/* SIGNUP STEP */}
            {step === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignup}
                className="space-y-5"
              >
                {/* Email pill */}
                <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <MailCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">New Account</p>
                    <p className="text-sm font-bold text-zinc-700 truncate">{email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-xs font-bold text-orange-600 hover:underline px-2"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auth-new-password" className="text-sm font-bold text-zinc-700 ml-1">Create Password</Label>
                  <Input
                    id="auth-new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 transition-all"
                  />

                  {password.length > 0 && (
                    <div className="px-1 pt-1">
                      <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${strength}%`,
                            backgroundColor: strength < 50 ? '#ef4444' : strength < 75 ? '#f59e0b' : '#10b981'
                          }}
                          className="h-full transition-all"
                        />
                      </div>
                      <p className="text-[10px] font-bold mt-1 text-zinc-400 uppercase tracking-wider">
                        Strength: {strength < 50 ? 'Weak' : strength < 75 ? 'Good' : 'Very Strong'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auth-confirm-password" className="text-sm font-bold text-zinc-700 ml-1">Confirm Password</Label>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all ${confirmPassword.length > 0 && (passwordsMatch ? 'focus:border-green-500 focus:ring-green-500/10' : 'focus:border-red-500 focus:ring-red-500/10')
                      }`}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 h-14 rounded-2xl font-bold text-lg hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Create Account & Publish'}
                </Button>

                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('login'); setPassword(''); setConfirmPassword(''); }}
                    className="text-sm font-bold text-zinc-500 hover:text-orange-600 transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Go back
                  </button>
                </div>
              </motion.form>
            )}

            {/* OTP STEP */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center space-y-6">
                  <InputOTP
                    maxLength={6}
                    value={otpToken}
                    onChange={(val) => setOtpToken(val)}
                    onComplete={() => handleOtpVerify()}
                    autoFocus
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="h-14 w-12 rounded-xl border-zinc-200 text-lg font-bold bg-zinc-50" />
                      <InputOTPSlot index={1} className="h-14 w-12 rounded-xl border-zinc-200 text-lg font-bold bg-zinc-50" />
                      <InputOTPSlot index={2} className="h-14 w-12 rounded-xl border-zinc-200 text-lg font-bold bg-zinc-50" />
                      <InputOTPSlot index={3} className="h-14 w-12 rounded-xl border-zinc-200 text-lg font-bold bg-zinc-50" />
                      <InputOTPSlot index={4} className="h-14 w-12 rounded-xl border-zinc-200 text-lg font-bold bg-zinc-50" />
                      <InputOTPSlot index={5} className="h-14 w-12 rounded-xl border-zinc-200 text-lg font-bold bg-zinc-50" />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    onClick={() => handleOtpVerify()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 h-14 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-70"
                    disabled={loading || otpToken.length < 6}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Verify & Publish'}
                  </Button>

                  <div className="text-center space-y-3">
                    <p className="text-sm text-zinc-500">
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || resending}
                        className="font-bold text-orange-600 hover:underline disabled:text-zinc-400 disabled:no-underline"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend now'}
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-wider"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-50 text-center">
            <p className="text-zinc-400 text-xs leading-relaxed">
              By continuing, you agree to Portid's{' '}
              <Link to="/terms" className="font-bold hover:text-orange-600 transition-colors" onClick={onClose}>Terms</Link> and{' '}
              <Link to="/privacy" className="font-bold hover:text-orange-600 transition-colors" onClick={onClose}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InlineAuthModal;
