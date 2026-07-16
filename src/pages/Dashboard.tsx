import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  User,
  Image as ImageIcon,
  Globe,
  Plus,
  Star,
  LogOut,
  Settings,
  Search,
  Bell,
  ExternalLink,
  QrCode,
  X,
  HelpCircle,
  Loader2
} from 'lucide-react';
import EditProfile from './EditProfile';
import ProfileAnalytics from './ProfileAnalytics';
import { PremiumLoader } from '@/components/PremiumLoader';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import QRCodeStyling from 'qr-code-styling';

const SIDEBAR_NAV = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'connect', label: 'Connect', icon: Globe },
  { id: 'tools', label: 'Tools', icon: Plus },
  { id: 'design', label: 'Design', icon: Star },
];

const Dashboard = () => {
  const { user, planTier, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [profileData, setProfileData] = useState<{ id: string, slug: string, brand_name: string, theme: string } | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, slug, brand_name, theme')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile Fetch Error:", profileError);
          toast.error("Failed to load profile.");
        }

        if (profile) {
          setProfileData({
            id: profile.id,
            slug: profile.slug,
            brand_name: profile.brand_name || 'My Profile',
            theme: profile.theme || 'minimal'
          });
        } else {
          navigate('/create-profile', { replace: true });
        }
      } catch (err) {
        console.error("Dashboard fetchData error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // QR Tag management states
  const [qrs, setQrs] = useState<any[]>([]);
  const [qrsLoading, setQrsLoading] = useState(true);
  const [editingQrId, setEditingQrId] = useState<string | null>(null);
  const [editDestType, setEditDestType] = useState<'profile' | 'custom'>('profile');
  const [editDestValue, setEditDestValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchQRs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*, profiles(brand_name, slug)')
        .eq('user_id', user.id);
      if (error) throw error;
      setQrs(data || []);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
    } finally {
      setQrsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'overview') {
      fetchQRs();
    }
  }, [user, activeTab]);

  const handleTogglePause = async (qrId: string, currentPaused: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_paused: !currentPaused })
        .eq('id', qrId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`QR code ${!currentPaused ? 'paused' : 'resumed'} successfully.`);
      fetchQRs();
    } catch (err: any) {
      console.error("Error toggling pause state:", err);
      toast.error(err.message || "Failed to toggle status.");
    }
  };

  const handleDeleteQR = async (qrId: string, code: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete dynamic QR code "${code}"? This will permanently disable it.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("QR code deleted successfully.");
      fetchQRs();
    } catch (err: any) {
      console.error("Error deleting QR code:", err);
      toast.error(err.message || "Failed to delete QR code.");
    }
  };

  const startEditingDestination = (qr: any) => {
    setEditingQrId(qr.id);
    setEditDestType(qr.assigned_profile_id ? 'profile' : 'custom');
    setEditDestValue(qr.custom_url || '');
  };

  const handleSaveDestination = async (qrId: string) => {
    setEditLoading(true);
    try {
      const isProfile = editDestType === 'profile';
      const profileId = isProfile ? profileData?.id : null;
      let targetUrl = isProfile ? null : editDestValue.trim();

      if (!isProfile) {
        if (!targetUrl) {
          toast.error("Please enter a custom URL.");
          setEditLoading(false);
          return;
        }
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = 'https://' + targetUrl;
        }
        try {
          new URL(targetUrl);
        } catch (_) {
          toast.error("Please enter a valid web URL.");
          setEditLoading(false);
          return;
        }
      } else {
        if (!profileId) {
          toast.error("Profile not found.");
          setEditLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('qr_codes')
        .update({
          assigned_profile_id: profileId,
          custom_url: targetUrl,
          destination_type: isProfile ? 'profile' : 'custom'
        })
        .eq('id', qrId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Destination updated successfully.");
      setEditingQrId(null);
      fetchQRs();
    } catch (err: any) {
      console.error("Error updating destination:", err);
      toast.error(err.message || "Failed to update destination.");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading || authLoading) {
    return <PremiumLoader />;
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="flex h-screen bg-ethereal overflow-hidden font-body text-zinc-900">

      {/* Sidebar (Clean White Pill-based) */}
      <aside className="hidden md:flex flex-col w-[280px] bg-white z-20 shrink-0">
        <div className="h-24 flex items-center px-10">
          <img src="/portid-logo.png" alt="Portid" className="h-10 w-auto object-contain scale-[2.2] origin-left" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-6 space-y-0.5">
          <p className="px-4 text-[11px] font-bold text-zinc-400 mb-3">Menu</p>

          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition-all ${activeTab === item.id
                  ? 'bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
            >
              <div className={`p-1.5 rounded-full ${activeTab === item.id ? 'bg-white/20' : 'bg-zinc-100/80 text-orange-500 group-hover:bg-zinc-200'}`}>
                <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-white' : ''}`} />
              </div>
              {item.label}
            </button>
          ))}

          {/* QR Generator Link */}
          <Link
            to="/qr-code-generator"
            className="w-full flex items-center justify-between px-5 py-2.5 rounded-full text-[13.5px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-1.5 rounded-full bg-zinc-100/80 text-orange-500">
                <QrCode className="h-4 w-4" />
              </div>
              <span>QR Generator</span>
            </div>
            <span className="bg-orange-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none tracking-wide animate-pulse mr-2">
              New
            </span>
          </Link>
        </div>

        <div className="p-6 space-y-2">
          <p className="px-4 text-[11px] font-bold text-zinc-400 mb-4">Settings</p>
          <button onClick={() => navigate('/pricing')} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-full text-[13.5px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left">
            <div className="p-1.5 rounded-full bg-zinc-100/80 text-orange-500"><Settings className="h-4 w-4" /></div>
            Billing & Plan
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-support"))} 
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-full text-[13.5px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left"
          >
            <div className="p-1.5 rounded-full bg-zinc-100/80 text-orange-500">
              <HelpCircle className="h-4 w-4" />
            </div>
            Help & Support
          </button>

          <div className="pt-4">
            <button onClick={handleSignOut} className="w-max flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-[0_8px_20px_rgba(99,102,241,0.25)] transition-all">
              Signout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Floating Top Header (Desktop) */}
        <header className="hidden md:flex items-center justify-end px-8 py-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Wallet/Live View Pill */}
            <a
              href={`/p/${profileData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-[13px] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all"
            >
              <Globe className="h-4 w-4 opacity-80" />
              Live Profile <ExternalLink className="h-3 w-3 opacity-60 ml-1" />
            </a>

            {/* Notification Bell */}
            <button className="h-11 w-11 flex items-center justify-center bg-white rounded-full shadow-sm border border-white/50 text-zinc-600 hover:text-orange-500 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 bg-white p-1.5 pr-5 rounded-full shadow-sm border border-white/50 ml-2">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                <User className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-zinc-900 leading-none">Your Account</span>
                <span className="text-[10px] font-medium text-zinc-500 mt-0.5">{user?.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden h-20 flex items-center justify-between px-6 bg-white/80 backdrop-blur-lg border-b border-zinc-100 shrink-0 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src="/portid-logo.png" alt="Portid" className="h-9 w-auto object-contain scale-[2.0] origin-left" />
          </div>

          <div className="flex items-center gap-3">
            {/* Live profile link on mobile */}
            <a
              href={`/p/${profileData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center bg-blue-50 text-blue-600 rounded-full border border-blue-100 hover:bg-blue-100 active:scale-95 transition-all shadow-sm"
              title="View Live Profile"
            >
              <Globe className="h-4.5 w-4.5" />
            </a>

            {/* QR Generator Link */}
            <Link
              to="/qr-code-generator"
              className="flex h-9 w-9 items-center justify-center bg-orange-50 text-orange-500 rounded-full border border-orange-100 hover:bg-orange-100 active:scale-95 transition-all shadow-sm relative"
              title="QR Generator"
            >
              <QrCode className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
            </Link>

            {/* User Avatar Action Menu Pill */}
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="flex items-center gap-1 bg-zinc-50 border border-zinc-200/60 p-1 pr-2 rounded-full shadow-sm hover:bg-zinc-100 active:scale-95 transition-all ml-1"
            >
              <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                <User className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider">Menu</span>
            </button>
          </div>
        </div>

        {/* Content Scroll Area with mobile bottom-padding */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 md:pb-8">

          {activeTab === 'overview' ? (
            <div className="space-y-6 sm:space-y-8 pt-4">
              {/* QR Code list/management section */}
              {/* QR Code list/management section (Sleek Bar Layout) */}
              {qrs.length > 0 && (
                <div className="space-y-3 mb-6">
                  {qrs.map((qr) => {
                    const isEditing = editingQrId === qr.id;
                    const isDynamicCode = qr.code.startsWith('DYN_');
                    
                    return (
                      <div key={qr.id} className="bg-[#131313] rounded-xl flex items-center justify-between p-3.5 pr-4 border border-zinc-800/80 shadow-sm relative overflow-hidden">
                        {/* Left section: Identity */}
                        <div className="flex items-center gap-4">
                          <h4 className="text-sm font-bold text-white min-w-[130px] truncate">
                            {qr.name || `My Dynamic QR`}
                          </h4>
                          <span className="text-[11px] font-bold text-orange-500 min-w-[90px]">
                            {qr.code}
                          </span>
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {qr.is_paused ? 'Paused' : 'Assigned'}
                          </span>
                        </div>

                        {/* Middle section: Destination & Style */}
                        <div className="flex items-center gap-8 hidden lg:flex">
                          {!isEditing ? (
                            <a href={qr.assigned_profile_id ? `/${qr.profiles?.slug}` : (qr.custom_url || '#')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors text-xs font-medium cursor-pointer max-w-[200px] truncate">
                              {qr.assigned_profile_id ? `/${qr.profiles?.slug}` : (qr.custom_url || 'https://portid.in')}
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2">
                                <select
                                  value={editDestType}
                                  onChange={(e) => setEditDestType(e.target.value as any)}
                                  className="h-7 px-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-[10px] font-bold focus:border-orange-500 focus:outline-none appearance-none"
                                >
                                  <option value="profile">Profile</option>
                                  <option value="custom">Custom</option>
                                </select>
                                {editDestType === 'custom' && (
                                  <Input
                                    placeholder="https://example.com"
                                    value={editDestValue}
                                    onChange={(e) => setEditDestValue(e.target.value)}
                                    className="h-7 rounded-lg border-zinc-700 bg-zinc-800 text-white text-[10px] w-[140px]"
                                  />
                                )}
                                <Button
                                  type="button"
                                  onClick={() => handleSaveDestination(qr.id)}
                                  disabled={editLoading}
                                  className="h-7 px-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[9px] uppercase tracking-wider"
                                >
                                  {editLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => setEditingQrId(null)}
                                  className="h-7 px-2 rounded-lg text-zinc-400 hover:text-white"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: qr.style?.color || '#f97316' }}></div>
                            <span className="capitalize">{qr.style?.dotsType || 'Rounded'} / {qr.style?.cornersSquareType || 'Extra-Rounded'}</span>
                          </div>
                        </div>

                        {/* Right section: Actions */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => startEditingDestination(qr)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors border border-zinc-700 uppercase tracking-wider"
                          >
                            Link
                          </button>
                          <button 
                            onClick={() => navigate('/qr-code-generator')}
                            className="bg-zinc-800 hover:bg-zinc-700 text-orange-500 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors border border-zinc-700 uppercase tracking-wider"
                          >
                            Style
                          </button>
                          <button 
                            onClick={() => {
                                const color = qr.style?.color || '#f97316';
                                const bgColor = qr.style?.transparent ? 'transparent' : (qr.style?.bgColor || '#ffffff');
                                const inst = new QRCodeStyling({
                                  width: 1024,
                                  height: 1024,
                                  data: qr.code.startsWith('DYN_') ? `${window.location.origin}/q/${qr.code}` : qr.code,
                                  dotsOptions: { color, type: (qr.style?.dotsType || 'rounded') as any },
                                  cornersSquareOptions: { color, type: (qr.style?.cornersSquareType || 'extra-rounded') as any },
                                  cornersDotOptions: { color, type: (qr.style?.cornersDotType || 'dot') as any },
                                  backgroundOptions: { color: bgColor }
                                });
                                inst.download({ name: `qr-${qr.code}`, extension: 'png' });
                                toast.success("Download started!");
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-700 flex items-center justify-center"
                            title="Download QR"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          </button>
                          {isDynamicCode && (
                            <button 
                              onClick={() => handleDeleteQR(qr.id, qr.code)}
                              className="p-1.5 bg-zinc-800/80 hover:bg-rose-900/50 rounded-lg text-rose-500 transition-colors border border-rose-900/30 flex items-center justify-center"
                              title="Delete QR"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <ProfileAnalytics embedded={true} profileId={profileData.id} />
            </div>
          ) : (
            <EditProfile passedId={profileData.id} forcedTab={activeTab} embedded={true} />
          )}

        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Glassmorphic) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-lg border-t border-zinc-200/50 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] px-6 py-2 pb-safe">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center py-1.5 px-3 relative min-w-[50px] transition-all"
              >
                {/* Active glow transition */}
                {isActive && (
                  <motion.div
                    layoutId="active-bottom-tab"
                    className="absolute top-0 w-8 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={`p-1 rounded-full transition-all duration-300 ${isActive ? 'text-orange-500 scale-110' : 'text-zinc-400 hover:text-zinc-600'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-[9px] font-black tracking-tight mt-0.5 transition-colors uppercase ${isActive ? 'text-orange-600' : 'text-zinc-400'}`}>
                  {item.label === 'Dashboard' ? 'Home' : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick-Actions Profile Drawer */}
      <AnimatePresence>
        {isProfileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm md:hidden"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[320px] bg-white shadow-2xl p-8 flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Account</span>
                    <span className="text-xs font-bold text-zinc-800 truncate max-w-[170px]">{user?.email?.split('@')[0]}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="h-9 w-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Info Cards (Active Plan Tier Badge) */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mb-6 flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Plan Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${planTier === 'premium'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'bg-zinc-200 text-zinc-600'
                  }`}>
                  {planTier || 'Basic'}
                </span>
              </div>

              {/* Quick Actions List */}
              <div className="flex-1 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">Quick Actions</p>

                <a
                  href={`/p/${profileData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-600 text-white font-bold text-[13px] shadow-[0_6px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 active:scale-95 transition-all text-left"
                >
                  <span className="flex items-center gap-3">
                    <Globe className="h-4.5 w-4.5" />
                    Live Profile
                  </span>
                  <ExternalLink className="h-4 w-4 opacity-75" />
                </a>

                <Link
                  to="/qr-code-generator"
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-extrabold text-[13px] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <QrCode className="h-4.5 w-4.5 text-orange-500" />
                    QR Generator
                  </span>
                  <span className="bg-orange-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none tracking-wide animate-pulse">
                    New
                  </span>
                </Link>

                <button
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    navigate('/pricing');
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-extrabold text-[13px] transition-all text-left"
                >
                  <Settings className="h-4.5 w-4.5 text-orange-500" />
                  Billing & Plan
                </button>

                <button
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    window.dispatchEvent(new CustomEvent("open-support"));
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-extrabold text-[13px] transition-all text-left"
                >
                  <HelpCircle className="h-4.5 w-4.5 text-orange-500" />
                  Help & Support
                </button>
              </div>

              {/* Footer with Sign Out */}
              <div className="pt-6 border-t border-zinc-100">
                <button
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 font-black text-xs uppercase tracking-widest transition-all"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
