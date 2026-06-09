import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Crown, 
  Zap, 
  ShieldCheck,
  CreditCard,
  MonitorSmartphone,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { loadRazorpayScript } from '@/lib/razorpay';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user, planTier } = useAuth();
  const navigate = useNavigate();

  const currentTier = planTier?.toLowerCase() || 'basic';

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please sign in or register to upgrade.");
      navigate('/auth');
      return;
    }

    if (currentTier === 'premium') {
      toast.info("You are already on the Pro Plan! 🎉");
      return;
    }

    setIsUpgrading(true);
    const loadingToast = toast.loading("Initializing payment gateway...");

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.dismiss(loadingToast);
        throw new Error("Razorpay SDK failed to load. Are you offline?");
      }

      // 2. Call Edge Function to create order
      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: { 
          action: 'create_order', 
          billingCycle 
        }
      });

      if (error) throw error;
      if (!data?.order_id) {
        throw new Error("Failed to initialize transaction details.");
      }

      toast.dismiss(loadingToast);

      // 3. Open Razorpay checkout
      const options = {
        key: data.razorpay_key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Portid",
        description: `Upgrade to Pro Plan (${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'})`,
        order_id: data.order_id,
        prefill: {
          email: user.email || '',
        },
        handler: async (response: any) => {
          const verifyingToast = toast.loading("Verifying payment transaction...");
          try {
            // 4. Verify payment in Edge Function
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
              body: {
                action: 'verify_payment',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                billingCycle
              }
            });

            if (verifyError) throw verifyError;
            if (!verifyData?.success) {
              throw new Error(verifyData?.error || "Signature verification failed.");
            }

            toast.dismiss(verifyingToast);
            toast.success("Payment verified! Welcome to Pro Plan! 🎉");
            
            // Reload auth context to sync roles
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (err: any) {
            toast.dismiss(verifyingToast);
            console.error("[Verification Error]", err);
            toast.error(err.message || "Failed to verify transaction. Please contact support.");
            setIsUpgrading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setIsUpgrading(false);
          }
        },
        theme: {
          color: "#f97316", // orange-500
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("[Upgrade Error]", err);
      toast.error(err.message || "Failed to initiate payment. Please try again.");
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-body text-zinc-900 pb-20">
      {/* Simple Header */}
      <nav className="border-b border-zinc-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <img src="/portid-logo.png" alt="Portid" className="h-8 w-auto grayscale opacity-50" />
          <div className="w-20 lg:w-32" /> {/* Spacer */}
        </div>
      </nav>

      <main className="container mx-auto px-4 mt-6 lg:mt-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="font-heading text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 mb-2">
            Upgrade your plan
          </h1>

          {/* Billing Toggle */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-zinc-900' : 'text-zinc-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 rounded-full bg-zinc-200 p-1 flex items-center transition-all hover:bg-zinc-300"
            >
              <motion.div 
                animate={{ x: billingCycle === 'yearly' ? 28 : 0 }}
                className="w-5 h-5 rounded-full bg-orange-500 shadow-md" 
              />
            </button>
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'yearly' ? 'text-zinc-900' : 'text-zinc-400'}`}>
              Yearly <span className="text-emerald-500 ml-1">(-16% Off)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* BASIC PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 flex flex-col relative group"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Basic</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-zinc-900">₹0</span>
                <span className="text-zinc-400 text-sm font-bold">/forever</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { text: 'Logo & Cover Image', check: true },
                { text: 'Up to 4 Contact/Social Links', check: true },
                { text: 'Physical Address & Maps Link', check: true },
                { text: 'Standard QR Code', check: true },
                { text: 'Media Gallery Uploads', check: false },
                { text: 'Custom Links & Tools Suite', check: false },
                { text: 'Design Studio Style Editor', check: false }
              ].map((f, i) => (
                <li key={i} className={`flex items-center gap-3 text-sm ${f.check ? 'text-zinc-600 font-medium' : 'text-zinc-300 line-through'}`}>
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${f.check ? 'text-zinc-300' : 'text-zinc-100'}`} /> {f.text}
                </li>
              ))}
            </ul>
            <Button variant="outline" disabled className="w-full rounded-2xl h-14 border-zinc-200 text-zinc-400 font-bold bg-zinc-50">
              {currentTier === 'basic' ? 'Current Plan' : 'Basic Tier'}
            </Button>
          </motion.div>

          {/* PRO PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl shadow-orange-500/10 flex flex-col relative scale-[1.05] z-10 text-white"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 py-1.5 px-6 bg-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-orange-400">
              Go Unlimited
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'monthly' ? '₹149' : '₹1,499'}
                </span>
                <span className="text-zinc-500 text-sm font-bold">
                  {billingCycle === 'monthly' ? '/month' : '/year'}
                </span>
              </div>
              {billingCycle === 'yearly' && <p className="text-emerald-500 text-[10px] font-bold mt-1">Billed annually (Save ₹289/year)</p>}
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { text: 'Images Uploading & Media Gallery', check: true },
                { text: 'Unlimited Contact & Social Links', check: true },
                { text: 'Other Links (Custom Links) Suite', check: true },
                { text: 'Branded QR with Transparent BG', check: true },
                { text: 'Premium Tools Suite & Lead Forms', check: true },
                { text: 'Design Studio Custom Themes Editor', check: true },
                { text: 'Remove Portid Branding Logo', check: true }
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" /> {f.text}
                </li>
              ))}
            </ul>
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white rounded-2xl h-14 font-black shadow-lg shadow-orange-500/20 border-0 text-base disabled:opacity-50"
            >
              {isUpgrading ? 'Processing...' : (currentTier === 'premium' ? 'Current Plan (Pro)' : 'Upgrade to Pro')}
            </Button>
          </motion.div>
        </div>



        <div className="mt-20 text-center">
          <p className="text-sm text-zinc-400 font-medium">© {new Date().getFullYear()} Portid Networking Technologies. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
