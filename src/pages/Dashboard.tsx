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
  X
} from 'lucide-react';
import EditProfile from './EditProfile';
import ProfileAnalytics from './ProfileAnalytics';
import { PremiumLoader } from '@/components/PremiumLoader';
import { toast } from 'sonner';
import QRGeneratorModal from '@/components/QRGeneratorModal';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [profileData, setProfileData] = useState<{id: string, slug: string, brand_name: string, theme: string} | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
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
              className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition-all ${
                activeTab === item.id 
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

          {/* QR Generator Trigger */}
          <button
            onClick={() => setIsQrOpen(true)}
            className="w-full flex items-center gap-4 px-5 py-2.5 rounded-full text-[13.5px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left"
          >
            <div className="p-1.5 rounded-full bg-zinc-100/80 text-orange-500 group-hover:bg-zinc-200">
               <QrCode className="h-4 w-4" />
            </div>
            QR Generator
          </button>
        </div>

        <div className="p-6 space-y-2">
           <p className="px-4 text-[11px] font-bold text-zinc-400 mb-4">Settings</p>
           <button onClick={() => navigate('/pricing')} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-full text-[13.5px] font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all">
             <div className="p-1.5 rounded-full bg-zinc-100/80 text-orange-500"><Settings className="h-4 w-4" /></div> 
             Billing & Plan
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

            {/* QR Generator Trigger */}
            <button 
              onClick={() => setIsQrOpen(true)}
              className="flex h-9 w-9 items-center justify-center bg-orange-50 text-orange-500 rounded-full border border-orange-100 hover:bg-orange-100 active:scale-95 transition-all shadow-sm"
              title="QR Generator"
            >
              <QrCode className="h-4.5 w-4.5" />
            </button>
            
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
            <ProfileAnalytics embedded={true} profileId={profileData.id} />
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  planTier === 'premium' 
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

                <button
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    setIsQrOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-extrabold text-[13px] transition-all text-left"
                >
                  <QrCode className="h-4.5 w-4.5 text-orange-500" />
                  QR Generator
                </button>

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

      <QRGeneratorModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        profiles={profileData ? [{
          id: profileData.id,
          slug: profileData.slug,
          brand_name: profileData.brand_name || 'My Profile',
          theme: profileData.theme || 'minimal'
        }] : []}
      />
    </div>
  );
};

export default Dashboard;
