import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, MailCheck, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type AuthStep = 'email' | 'password' | 'otp' | 'success';
type AuthMode = 'login' | 'signup';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>('email');
  const [mode, setMode] = useState<AuthMode>('login');

  const { signIn, signUp, signInWithGoogle, verifyOtp, resendOtp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [otpToken, setOtpToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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

  const handleEmailNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // We'll try to check if the user exists via a simple RPC or profiles check
      // For now, since enumeration is protected, we'll default to the most likely state
      // but give the user a clear button to switch if we guessed wrong.

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'DUMMY_PASSWORD_CHECK_123',
      });

      // If we get an error that isn't "Invalid credentials", they are likely new
      const errorMsg = error?.message?.toLowerCase() || '';
      const status = (error as any)?.status;

      if (errorMsg.includes('email not confirmed')) {
        setMode('login');
        setStep('password');
      } else if (status === 400 && !errorMsg.includes('invalid login credentials')) {
        setMode('signup');
        setStep('password');
      } else {
        // Default to login but show a switch option
        setMode('login');
        setStep('password');
      }
    } catch (err) {
      setMode('login');
      setStep('password');
    } finally {
      setLoading(false);
    }
  };

  const [confirmPassword, setConfirmPassword] = useState('');

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
  const passwordsMatch = mode === 'login' || password === confirmPassword;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup' && !passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (mode === 'signup' && strength < 50) {
      toast.error("Please choose a stronger password");
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        const isInvalid = error.message?.toLowerCase().includes('invalid login credentials');
        if (isInvalid) {
          toast.error("Invalid credentials. Don't have an account? Sign up below.");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
      } else {
        navigate(from, { replace: true });
      }
    } else {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        // Safe check for status and message
        const isDuplicate = error.message?.toLowerCase().includes('already registered') ||
          (error as any).status === 400;

        if (isDuplicate) {
          toast.info("Welcome back! You already have an account. Please sign in.");
          setMode('login');
          setConfirmPassword('');
          return;
        } else {
          toast.error(error.message);
        }
      } else {
        setStep('otp');
        setResendTimer(30);
      }
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
    } else {
      toast.success("Email verified successfully!");
      // The session will automatically update via AuthContext
      // The useEffect at the top will handle navigation once user state is populated
    }
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
      setResendTimer(60); // Longer wait after first resend
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const timeout = setTimeout(() => setGoogleLoading(false), 8000);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
      clearTimeout(timeout);
    }
  };

  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 font-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-orange-500/5 text-center"
        >
          <div className="h-20 w-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MailCheck className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 mb-4">Check your inbox</h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            We've sent a verification link to <span className="font-bold text-zinc-900">{email}</span>.
            Please confirm your email to start building your brand.
          </p>
          <Button
            onClick={() => { setStep('email'); setEmail(''); }}
            className="w-full bg-zinc-900 text-white rounded-2xl h-14 font-bold shadow-xl hover:bg-zinc-800 transition-all border-0"
          >
            Back to home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 font-body">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-orange-500/5">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img src="/portid-logo.png" alt="Portid" className="h-[60px] mx-auto object-contain scale-[1.8] group-hover:scale-[1.9] transition-transform" />
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold text-zinc-900">
            {step === 'email' ? 'Get Started' : mode === 'login' ? 'Welcome back' : 'Join Portid'}
          </h1>
          <p className="mt-2 text-zinc-500">
            {step === 'email' ? 'Enter your email to continue' : 'Secure your digital identity'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailNext}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-zinc-700 ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
            </motion.form>
          ) : step === 'otp' ? (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MailCheck className="h-8 w-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Verify your email</h2>
                <p className="text-sm text-zinc-500">
                  We sent a 6-digit code to <br />
                  <span className="font-bold text-zinc-900">{email}</span>
                </p>
              </div>

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
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Verify Code'}
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
          ) : (
            <motion.form
              key="password-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleAuthSubmit}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 mb-2">
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
                  <Label htmlFor="password" title="At least 6 characters" className="text-sm font-bold text-zinc-700">Password</Label>
                  {mode === 'login' && (
                    <Link to="/forgot-password" className="text-xs font-semibold text-zinc-400 hover:text-orange-500 transition-colors">Forgot?</Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 transition-all"
                />

                {mode === 'signup' && password.length > 0 && (
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

              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-bold text-zinc-700 ml-1">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all ${confirmPassword.length > 0 && (passwordsMatch ? 'focus:border-green-500 focus:ring-green-500/10' : 'focus:border-red-500 focus:ring-red-500/10')
                      }`}
                  />
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 h-14 rounded-2xl font-bold text-lg mt-2 hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-70"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm font-bold text-zinc-500 hover:text-orange-600 transition-colors"
                >
                  {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
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
        </AnimatePresence>

        {step === 'email' && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-zinc-400">
                <span className="bg-white px-4">Or continue with</span>
              </div>
            </div>

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
          </>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
          <p className="text-zinc-400 text-xs leading-relaxed">
            By continuing, you agree to Portid's <br />
            <Link to="/terms" className="font-bold hover:text-orange-600 transition-colors">Terms of Service</Link> and <Link to="/privacy" className="font-bold hover:text-orange-600 transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
