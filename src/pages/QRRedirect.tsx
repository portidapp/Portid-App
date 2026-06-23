import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { QrCode, ArrowLeft, ShieldAlert, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeData {
  id: string;
  code: string;
  status: 'available' | 'assigned';
  assigned_profile_id: string | null;
  custom_url: string | null;
  profiles: {
    slug: string;
  } | null;
}

const QRRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'invalid' | 'unassigned' | null>(null);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  
  // Claiming flow states
  const [userProfiles, setUserProfiles] = useState<{ id: string; brand_name: string; slug: string }[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkQRCode = async () => {
      if (!code) {
        setErrorType('invalid');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('id, code, status, assigned_profile_id, custom_url, profiles(slug)')
          .eq('code', code)
          .maybeSingle();

        if (error) {
          console.error('Error fetching QR code:', error);
          setErrorType('invalid');
          setLoading(false);
          return;
        }

        if (!data) {
          setErrorType('invalid');
          setLoading(false);
          return;
        }

        const retrievedQr = data as unknown as QRCodeData;
        setQrData(retrievedQr);

        if (retrievedQr.status === 'assigned') {
          if (retrievedQr.custom_url) {
            let redirectUrl = retrievedQr.custom_url;
            if (!/^https?:\/\//i.test(redirectUrl)) {
              redirectUrl = 'https://' + redirectUrl;
            }
            window.location.replace(redirectUrl);
          } else if (retrievedQr.profiles?.slug) {
            window.location.replace(`/p/${retrievedQr.profiles.slug}`);
          } else {
            setErrorType('unassigned');
            setLoading(false);
          }
        } else {
          // Status is available (unassigned)
          setErrorType('unassigned');
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error checking QR code:', err);
        setErrorType('invalid');
        setLoading(false);
      }
    };

    checkQRCode();
  }, [code]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!user || errorType !== 'unassigned') return;
      setProfilesLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, brand_name, slug')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserProfiles(data || []);
        if (data && data.length > 0) {
          setSelectedProfileId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching user profiles:", err);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchUserProfiles();
  }, [user, errorType]);

  const handleConnectQR = async () => {
    if (!selectedProfileId || !code) return;
    setConnecting(true);
    try {
      // 1. Fetch current status to protect from double claiming
      const { data: qrCheck, error: checkError } = await supabase
        .from('qr_codes')
        .select('status')
        .eq('code', code)
        .maybeSingle();

      if (checkError) throw checkError;

      if (qrCheck?.status === 'assigned') {
        toast.error("This QR is already connected.");
        return;
      }

      // 2. Perform connect update
      const { error: updateError } = await supabase
        .from('qr_codes')
        .update({
          assigned_profile_id: selectedProfileId,
          status: 'assigned'
        })
        .eq('code', code);

      if (updateError) throw updateError;

      // 3. Redirect to the connected profile
      const profile = userProfiles.find(p => p.id === selectedProfileId);
      toast.success("QR Code successfully connected!");
      if (profile?.slug) {
        window.location.replace(`/p/${profile.slug}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Connect QR error:", err);
      toast.error(err.message || "Failed to connect this QR code.");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 text-zinc-800 px-4 relative overflow-hidden font-sans">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 border border-zinc-200/80 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-zinc-200/30 backdrop-blur-md relative z-10 text-center"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <QrCode className="h-6 w-6 text-orange-500" />
          <span className="font-heading text-lg font-black tracking-tight text-zinc-900">
            Portid <span className="text-orange-500">Codes</span>
          </span>
        </div>

        {errorType === 'invalid' ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-heading font-black tracking-tight text-zinc-900">
                Invalid QR Code
              </h1>
              <p className="text-sm font-semibold text-zinc-500 leading-relaxed px-2">
                This QR code does not exist or has been removed from our system.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <Button
                asChild
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
              >
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go to Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-bold text-xs uppercase tracking-wider"
              >
                <a href="mailto:support@portid.in?subject=Invalid QR Code Setup">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-heading font-black tracking-tight text-zinc-900">
                Connect QR Code
              </h1>
              <p className="text-sm font-semibold text-zinc-500 leading-relaxed">
                Connect this physical QR code to your business.
              </p>
            </div>

            {authLoading ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : !user ? (
              // Guest Flow
              <div className="space-y-4 pt-2">
                <p className="text-xs text-zinc-500 leading-normal px-4">
                  Log in or sign up to claim this physical QR code and direct customers to your Portid profile instantly.
                </p>
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <Button
                    asChild
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                  >
                    <Link to="/login" state={{ from: { pathname: `/q/${code}` } }}>
                      Log In to Connect
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-bold text-xs uppercase tracking-wider"
                  >
                    <Link to="/signup" state={{ from: { pathname: `/q/${code}` } }}>
                      Create Free Account
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              // Logged In Flow
              <div className="space-y-6 pt-2 text-left">
                {profilesLoading ? (
                  <div className="py-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : userProfiles.length === 0 ? (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-zinc-500 leading-normal px-4">
                      You haven't created any business profiles yet. Create a profile first to connect this QR code.
                    </p>
                    <Button
                      asChild
                      className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                    >
                      <Link to="/create-profile">
                        Create a Profile
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">
                        Select Destination Profile
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProfileId}
                          onChange={(e) => setSelectedProfileId(e.target.value)}
                          className="w-full h-12 pl-4 pr-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold focus:border-orange-500 focus:outline-none appearance-none cursor-pointer"
                        >
                          {userProfiles.map((p) => (
                            <option key={p.id} value={p.id} className="bg-white text-zinc-800">
                              {p.brand_name} (/{p.slug})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleConnectQR}
                      disabled={connecting || !selectedProfileId}
                      className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 relative overflow-hidden"
                    >
                      {connecting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <span>Connect QR Code</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <p className="text-[10px] text-zinc-400 mt-8 font-semibold tracking-wide uppercase">
          © {new Date().getFullYear()} Portid. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default QRRedirect;
