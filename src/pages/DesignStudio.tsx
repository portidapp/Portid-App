import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, X, Layout, Check, Palette, Star, Crown, 
  ChevronLeft, Sparkles, Smartphone, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LAYOUTS } from '@/lib/layouts';
import { encodeCustomTheme, parseCustomTheme, getThemeColors } from '@/lib/themes';
import ProfilePreview from '@/components/ProfilePreview';
import { PremiumLoader } from '@/components/PremiumLoader';

const THEMES = [
  { id: 'minimal',  label: 'Minimal',  colors: 'bg-white border border-gray-200' },
  { id: 'dark',     label: 'Dark',     colors: 'bg-[#0f172a]' },
  { id: 'luxury',   label: 'Luxury',   colors: 'bg-gradient-to-br from-amber-900 to-amber-700' },
  { id: 'modern',   label: 'Modern',   colors: 'bg-gradient-to-br from-blue-600 to-purple-600' },
  { id: 'colorful', label: 'Colorful', colors: 'bg-gradient-to-br from-pink-500 to-yellow-500' },
  { id: 'ocean',    label: 'Ocean',    colors: 'bg-gradient-to-br from-sky-900 to-cyan-800' },
  { id: 'forest',   label: 'Forest',   colors: 'bg-gradient-to-br from-green-900 to-green-700' },
  { id: 'sunset',   label: 'Sunset',   colors: 'bg-gradient-to-br from-orange-900 to-red-700' },
  { id: 'midnight', label: 'Midnight', colors: 'bg-gradient-to-br from-[#0f0f23] to-purple-900' },
  { id: 'rose',     label: 'Rose',     colors: 'bg-gradient-to-br from-rose-100 to-pink-200' },
  { id: 'lavender', label: 'Lavender', colors: 'bg-gradient-to-br from-indigo-100 to-purple-200' },
  { id: 'coffee',   label: 'Coffee',   colors: 'bg-gradient-to-br from-stone-200 to-stone-400' },
  { id: 'emerald',  label: 'Emerald',  colors: 'bg-gradient-to-br from-emerald-100 to-emerald-300' },
  { id: 'cherry',   label: 'Cherry',   colors: 'bg-gradient-to-br from-red-100 to-red-300' },
  { id: 'gold',     label: 'Gold',     colors: 'bg-gradient-to-br from-yellow-100 to-yellow-300' },
  { id: 'slate',    label: 'Slate',    colors: 'bg-gradient-to-br from-slate-200 to-slate-400' },
  { id: 'sapphire', label: 'Sapphire', colors: 'bg-gradient-to-br from-blue-200 to-blue-400' },
  { id: 'mint',     label: 'Mint',     colors: 'bg-gradient-to-br from-green-100 to-green-300' },
  { id: 'orange',   label: 'Orange',   colors: 'bg-gradient-to-br from-orange-400 to-amber-500' },
];

const DesignStudio = () => {
  const { id } = useParams<{ id: string }>();
  const { user, planTier, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (!id || authLoading) return;
    fetchProfile();
  }, [id, authLoading]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const themeData = data.theme || 'minimal';
      const isCustom = themeData.startsWith('custom:');
      const themeConfig = isCustom ? parseCustomTheme(themeData) : null;
      
      // Use standard theme as base if no custom configuration exists yet
      const fallbackColors = getThemeColors(isCustom ? 'minimal' : themeData);

      setForm({ 
        ...data, 
        theme: 'custom', 
        custom_bg:      themeConfig?.bg      || fallbackColors.bg,
        custom_text:    themeConfig?.text    || fallbackColors.text,
        custom_muted:   themeConfig?.muted   || fallbackColors.muted,
        custom_card_bg: themeConfig?.cardBg  || fallbackColors.cardBg,
        custom_btn_bg:  themeConfig?.btnBg   || fallbackColors.btnBg,
        custom_btn_text: themeConfig?.btnText || fallbackColors.btnText
      });
    } catch (error: any) {
      toast.error("Profile not found");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (updates: any) => {
    setForm((prev: any) => ({ ...prev, ...updates }));
  };

  const handleApply = async () => {
    if (!form || saving) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const themeValue = encodeCustomTheme({
        bg: form.custom_bg,
        text: form.custom_text,
        muted: form.custom_muted,
        cardBg: form.custom_card_bg,
        btnBg: form.custom_btn_bg,
        btnText: form.custom_btn_text
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          theme: themeValue,
          layout: form.layout,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Design saved successfully!");
      navigate(`/dashboard?tab=design`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const [view, setView] = useState<'tools' | 'preview'>('tools');

  if (loading || authLoading) return <PremiumLoader />;

  if (planTier !== 'premium') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 sm:p-10 rounded-[3rem] shadow-2xl">
          <div className="mx-auto bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-950 p-4 rounded-3xl w-16 h-16 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20">
            <Crown className="h-8 w-8 fill-current text-white animate-pulse" />
          </div>

          <h2 className="text-3xl font-black tracking-tight leading-tight">Design Studio is Premium 🎨</h2>
          <p className="text-zinc-400 font-medium mt-4 text-sm leading-relaxed">
            Custom brand palettes, custom backgrounds, card surfaces, and tailor-made button styling are exclusive to Premium users.
          </p>

          <div className="mt-8 space-y-3 bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800 text-left">
            <div className="flex items-center gap-3">
              <span className="text-purple-400 text-sm">✓</span>
              <span className="text-xs font-bold text-zinc-300">Custom Screen Backgrounds</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 text-sm">✓</span>
              <span className="text-xs font-bold text-zinc-300">Custom Surface Card Colors</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 text-sm">✓</span>
              <span className="text-xs font-bold text-zinc-300">Action Button Colors</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 text-sm">✓</span>
              <span className="text-xs font-bold text-zinc-300">Full Premium Typography Details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-8">
            <Button
              onClick={() => navigate('/pricing')}
              className="h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 rounded-2xl font-bold uppercase text-xs tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
            >
              Upgrade to Premium
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/dashboard?tab=design`)}
              className="h-12 text-zinc-400 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
      {/* Controls Container */}
      <div className={`w-full md:w-[420px] h-full border-r border-zinc-100 overflow-y-auto p-6 md:p-8 flex flex-col bg-white relative z-10 shadow-2xl transition-all duration-500 ${
        view === 'tools' ? 'translate-x-0' : '-translate-x-full md:translate-x-0 hidden md:flex'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/dashboard?tab=design`)}
              className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 leading-tight">Design Studio</h2>
              <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Premium Suite</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/dashboard?tab=design`)} 
            className="h-9 w-9 flex items-center justify-center bg-muted/50 hover:bg-muted rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-8 pb-32">
          {/* Section: Structure */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
               <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Structure</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {LAYOUTS.map(l => (
                <button
                  key={l.id}
                  onClick={() => updateForm({ layout: l.id })}
                  className={`group relative text-left p-3 rounded-xl border-2 transition-all duration-300 ${
                    form.layout === l.id 
                      ? 'border-purple-500 bg-purple-50/10 shadow-lg shadow-purple-500/5' 
                      : 'border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                      <span className={`text-[11px] font-black uppercase tracking-tight ${form.layout === l.id ? 'text-purple-600' : 'text-zinc-600'}`}>{l.label}</span>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${form.layout === l.id ? 'border-purple-500 bg-purple-500' : 'border-zinc-200'}`}>
                         {form.layout === l.id && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-medium leading-relaxed">{l.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Branding Palette */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
               <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Branding Palette</h3>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Canvas & Surfaces</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: 'Screen Background',  key: 'custom_bg' },
                      { label: 'Card Surface',       key: 'custom_card_bg' },
                    ].map(({ label, key }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50 group hover:bg-white hover:shadow-sm transition-all">
                        <div>
                           <p className="text-[11px] font-bold text-zinc-900">{label}</p>
                           <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{form[key as keyof typeof form]}</p>
                        </div>
                        <div className="relative h-9 w-9 rounded-[10px] border-2 border-white shadow-xl shadow-black/5 overflow-hidden ring-1 ring-zinc-200 group-hover:scale-105 transition-transform">
                          <div className="absolute inset-0" style={{ backgroundColor: form[key as keyof typeof form] }} />
                          <input
                            type="color"
                            value={form[key as keyof typeof form]}
                            onChange={(e) => updateForm({ [key]: e.target.value, theme: 'custom' })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Typography Details</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: 'Primary Text',    key: 'custom_text' },
                      { label: 'Muted Details',   key: 'custom_muted' },
                    ].map(({ label, key }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50 group hover:bg-white hover:shadow-sm transition-all">
                        <div>
                           <p className="text-[11px] font-bold text-zinc-900">{label}</p>
                           <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{form[key as keyof typeof form]}</p>
                        </div>
                        <div className="relative h-9 w-9 rounded-[10px] border-2 border-white shadow-xl shadow-black/5 overflow-hidden ring-1 ring-zinc-200 group-hover:scale-105 transition-transform">
                          <div className="absolute inset-0" style={{ backgroundColor: form[key as keyof typeof form] }} />
                          <input
                            type="color"
                            value={form[key as keyof typeof form]}
                            onChange={(e) => updateForm({ [key]: e.target.value, theme: 'custom' })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Call to Actions</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: 'Primary Action',    key: 'custom_btn_bg' },
                      { label: 'Action Icon/Text',  key: 'custom_btn_text' },
                    ].map(({ label, key }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50 group hover:bg-white hover:shadow-sm transition-all">
                        <div>
                           <p className="text-[11px] font-bold text-zinc-900">{label}</p>
                           <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{form[key as keyof typeof form]}</p>
                        </div>
                        <div className="relative h-9 w-9 rounded-[10px] border-2 border-white shadow-xl shadow-black/5 overflow-hidden ring-1 ring-zinc-200 group-hover:scale-105 transition-transform">
                          <div className="absolute inset-0" style={{ backgroundColor: form[key as keyof typeof form] }} />
                          <input
                            type="color"
                            value={form[key as keyof typeof form]}
                            onChange={(e) => updateForm({ [key]: e.target.value, theme: 'custom' })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer (Desktop Fixed) */}
      <div className="hidden md:block fixed bottom-0 left-0 w-[420px] bg-white/80 backdrop-blur-2xl border-t border-zinc-100 p-6 z-20">
        <button 
          onClick={handleApply} 
          disabled={saving}
          className="w-full h-12 rounded-xl bg-zinc-900 text-white font-black text-xs tracking-widest uppercase shadow-xl shadow-zinc-950/10 hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? "SAVING..." : (
             <>
               <Check className="h-4 w-4 text-purple-500" />
               CONFIRM & APPLY
             </>
          )}
        </button>
      </div>

      {/* Preview Container */}
      <div className={`flex-1 bg-[#050505] flex items-center justify-center p-6 md:p-12 relative overflow-hidden transition-all duration-500 ${
        view === 'preview' ? 'translate-x-0' : 'translate-x-full md:translate-x-0 hidden md:flex'
      }`}>
        {/* Immersive Elements */}
        <div className="absolute top-0 left-0 p-8 z-20 hidden md:block">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                 <Smartphone className="h-4 w-4 text-purple-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Simulator</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                 <Eye className="h-4 w-4 text-purple-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Public View</span>
              </div>
           </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative group scale-[0.85] md:scale-[1.05]">
          {/* Hardware Detailing */}
          <div className="absolute -left-1 top-28 w-1.5 h-12 bg-zinc-800 rounded-l-lg border-y border-white/5 opacity-50" />
          <div className="absolute -left-1 top-44 w-1.5 h-16 bg-zinc-800 rounded-l-lg border-y border-white/5 opacity-50" />
          <div className="absolute -left-1 top-64 w-1.5 h-16 bg-zinc-800 rounded-l-lg border-y border-white/5 opacity-50" />
          <div className="absolute -right-1 top-44 w-1.5 h-24 bg-zinc-800 rounded-r-lg border-y border-white/5 opacity-50" />

          {/* The iPhone Chassis */}
          <div className="relative w-[320px] md:w-[375px] aspect-[9/19.5] max-h-[80vh] md:max-h-[88vh] bg-zinc-950 rounded-[3.5rem] p-3 md:p-3.5 shadow-2xl ring-1 ring-white/20 ring-inset border-[6px] md:border-[8px] border-zinc-900 overflow-hidden">
             {/* Notch (Dynamic Island Style) */}
             <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 md:w-28 h-5 md:h-6 bg-black rounded-full z-40 flex items-center justify-center border border-white/5 shadow-inner">
                <div className="absolute right-6 w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-blue-900/20 shadow-inner blur-[1px]" />
             </div>

             {/* Dynamic Glass Reflection */}
             <div className="absolute inset-0 z-30 pointer-events-none opacity-30 bg-gradient-to-tr from-transparent via-white/5 to-white/10 skew-x-[-15deg] translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1500 ease-in-out" />

             {/* The Screen Content */}
             <div className="w-full h-full bg-white rounded-[2.2rem] md:rounded-[2.5rem] overflow-hidden overflow-y-auto hidden-scrollbar relative border border-black/5">
                <ProfilePreview form={form} />
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Switcher & Footer */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-2xl border-t border-zinc-100 px-6 py-4 z-[60] flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
           <button 
             onClick={() => setView('tools')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
               view === 'tools' ? 'bg-white text-purple-600 shadow-sm' : 'text-zinc-400'
             }`}
           >
             Tools
           </button>
           <button 
             onClick={() => setView('preview')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
               view === 'preview' ? 'bg-white text-purple-600 shadow-sm' : 'text-zinc-400'
             }`}
           >
             Preview
           </button>
        </div>
        
        <button 
          onClick={handleApply}
          disabled={saving}
          className="h-12 px-6 rounded-2xl bg-zinc-950 text-white flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-zinc-950/20"
        >
          <Check className="h-4 w-4 text-purple-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">{saving ? "SAVING..." : "APPLY"}</span>
        </button>
      </div>
    </div>
  );
};

export default DesignStudio;
