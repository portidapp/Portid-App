import { PremiumLoader } from '@/components/PremiumLoader';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowLeft, ArrowRight, Check, X, Crown, Palette, Zap, Layout } from 'lucide-react';
import ProfilePreview from '@/components/ProfilePreview';
import { LAYOUTS } from '@/lib/layouts';
import { encodeCustomTheme } from '@/lib/themes';
import { compressAndConvertToWebP } from '@/lib/images';
import { motion, AnimatePresence } from 'framer-motion';
import InlineAuthModal from '@/components/InlineAuthModal';
import { User } from '@supabase/supabase-js';

const CATEGORIES = [
  { id: 'Personal Brand', label: 'Personal Brand', icon: '👤', popular: true, description: 'Influencers, Artists, Creators' },
  { id: 'Shop', label: 'Shop', icon: '🏪', popular: true, description: 'Retailers, Boutiques, E-commerce' },
  { id: 'Restaurant', label: 'Restaurant', icon: '🍽', popular: true, description: 'Cafes, Bars, Food Brands' },
  { id: 'Salon', label: 'Salon', icon: '💇', description: 'Beauty, Hair, Wellness' },
  { id: 'Gym', label: 'Gym', icon: '💪', description: 'Fitness, Training, Sports' },
  { id: 'Doctor', label: 'Doctor', icon: '🩺', description: 'Medical, Health, Clinics' },
  { id: 'Hotel', label: 'Hotel', icon: '🏨', description: 'Stay, Travel, Hospitality' },
  { id: 'Startup', label: 'Startup', icon: '🚀', description: 'Tech, Innovation, New Ventures' },
  { id: 'Corporate', label: 'Corporate', icon: '🏢', description: 'Business, Agencies, Firms' },
  { id: 'Other', label: 'Other', icon: '✍️', description: 'Type your own category' },
];

const THEMES = [
  { id: 'minimal', label: 'Minimal', colors: 'bg-white border border-gray-200' },
  { id: 'dark', label: 'Dark', colors: 'bg-[#0f172a]' },
  { id: 'luxury', label: 'Luxury', colors: 'bg-gradient-to-br from-amber-900 to-amber-700' },
  { id: 'modern', label: 'Modern', colors: 'bg-gradient-to-br from-blue-600 to-purple-600' },
  { id: 'colorful', label: 'Colorful', colors: 'bg-gradient-to-br from-pink-500 to-yellow-500' },
  { id: 'ocean', label: 'Ocean', colors: 'bg-gradient-to-br from-sky-900 to-cyan-800' },
  { id: 'forest', label: 'Forest', colors: 'bg-gradient-to-br from-green-900 to-green-700' },
  { id: 'sunset', label: 'Sunset', colors: 'bg-gradient-to-br from-orange-900 to-red-700' },
  { id: 'midnight', label: 'Midnight', colors: 'bg-gradient-to-br from-[#0f0f23] to-purple-900' },
  { id: 'rose', label: 'Rose', colors: 'bg-gradient-to-br from-rose-100 to-pink-200' },
  { id: 'lavender', label: 'Lavender', colors: 'bg-gradient-to-br from-indigo-100 to-purple-200' },
  { id: 'coffee', label: 'Coffee', colors: 'bg-gradient-to-br from-stone-200 to-stone-400' },
  { id: 'emerald', label: 'Emerald', colors: 'bg-gradient-to-br from-emerald-100 to-emerald-300' },
  { id: 'cherry', label: 'Cherry', colors: 'bg-gradient-to-br from-red-100 to-red-300' },
  { id: 'gold', label: 'Gold', colors: 'bg-gradient-to-br from-yellow-100 to-yellow-300' },
  { id: 'slate', label: 'Slate', colors: 'bg-gradient-to-br from-slate-200 to-slate-400' },
  { id: 'sapphire', label: 'Sapphire', colors: 'bg-gradient-to-br from-blue-200 to-blue-400' },
  { id: 'mint', label: 'Mint', colors: 'bg-gradient-to-br from-green-100 to-green-300' },
  { id: 'orange', label: 'Orange', colors: 'bg-gradient-to-br from-orange-400 to-amber-500' },
  { id: 'custom', label: 'Custom', colors: 'bg-gradient-to-br from-violet-500 to-fuchsia-500' },
];

interface FormData {
  category: string;
  brand_name: string;
  tagline: string;
  description: string;
  logo: File | null;
  cover: File | null;
  logo_preview: string;
  cover_preview: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  website: string;
  email: string;
  google_review: string;
  location: string;
  theme: string;
  layout: string;
  // custom theme colors
  custom_bg: string;
  custom_text: string;
  custom_muted: string;
  custom_card_bg: string;
  custom_btn_bg: string;
  custom_btn_text: string;
  address: string;
  lead_form_enabled: boolean;
  lead_form_title: string;
  custom_link_label: string;
  custom_link_url: string;
  products: { id: string; title: string; description: string; image: File | null; preview: string }[];
}

const initialForm: FormData = {
  category: '', brand_name: '', tagline: '', description: '',
  logo: null, cover: null, logo_preview: '', cover_preview: '',
  phone: '', whatsapp: '', instagram: '', facebook: '',
  linkedin: '', twitter: '', youtube: '', tiktok: '',
  website: '', email: '', google_review: '', location: '',
  theme: 'minimal', layout: 'classic',
  custom_bg: '#ffffff', custom_text: '#0f172a', custom_muted: '#64748b',
  custom_card_bg: '#f8fafc', custom_btn_bg: '#0f172a', custom_btn_text: '#ffffff',
  address: '',
  lead_form_enabled: false,
  lead_form_title: 'Enquiry',
  custom_link_label: '',
  custom_link_url: '',
  products: [],
};

const CreateProfile = () => {
  const { user, planTier, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(() => {
    const savedStep = sessionStorage.getItem('wizard_step');
    const parsed = savedStep ? parseInt(savedStep, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const [form, setForm] = useState<FormData>(() => {
    const savedForm = sessionStorage.getItem('wizard_form');
    if (savedForm && savedForm !== 'undefined') {
      try {
        const parsedForm = JSON.parse(savedForm);
        if (typeof parsedForm === 'object' && parsedForm !== null && !Array.isArray(parsedForm)) {
          return { ...initialForm, ...parsedForm, logo: null, cover: null, logo_preview: '', cover_preview: '' };
        }
      } catch (e) { }
    }
    return initialForm;
  });
  const [isOtherSelected, setIsOtherSelected] = useState(() => {
    const savedForm = sessionStorage.getItem('wizard_form');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        return parsedForm.category ? !CATEGORIES.some(c => c.id === parsedForm.category) : false;
      } catch (e) { }
    }
    return false;
  });
  const [otherCategory, setOtherCategory] = useState(() => {
    const savedForm = sessionStorage.getItem('wizard_form');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        return (parsedForm.category && !CATEGORIES.some(c => c.id === parsedForm.category)) ? parsedForm.category : '';
      } catch (e) { }
    }
    return '';
  });
  const [publishedProfile, setPublishedProfile] = useState<{ id: string; slug: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // 5-step wizard
  const steps = ['Brand & Category', 'Identity', 'Contact', 'Design', 'Preview'];

  const updateForm = (updates: Partial<FormData>) => setForm(prev => ({ ...prev, ...updates }));

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Persist to sessionStorage on changes
  useEffect(() => {
    const formToSave = { ...form };
    // Remove files and previews from serialization
    delete (formToSave as any).logo;
    delete (formToSave as any).cover;
    delete (formToSave as any).logo_preview;
    delete (formToSave as any).cover_preview;
    sessionStorage.setItem('wizard_form', JSON.stringify(formToSave));
    sessionStorage.setItem('wizard_step', step.toString());
  }, [form, step]);

  // Restore logo and cover files from sessionStorage on mount (for Google auth redirect restoration)
  useEffect(() => {
    const restoreFiles = async () => {
      const logoBase64 = sessionStorage.getItem('wizard_logo_base64');
      const coverBase64 = sessionStorage.getItem('wizard_cover_base64');
      
      const updates: any = {};
      
      if (logoBase64) {
        try {
          const res = await fetch(logoBase64);
          const blob = await res.blob();
          const file = new File([blob], 'logo.webp', { type: 'image/webp' });
          updates.logo = file;
          updates.logo_preview = URL.createObjectURL(file);
        } catch (e) {
          console.error("Error restoring logo:", e);
        }
      }
      
      if (coverBase64) {
        try {
          const res = await fetch(coverBase64);
          const blob = await res.blob();
          const file = new File([blob], 'cover.webp', { type: 'image/webp' });
          updates.cover = file;
          updates.cover_preview = URL.createObjectURL(file);
        } catch (e) {
          console.error("Error restoring cover:", e);
        }
      }
      
      if (Object.keys(updates).length > 0) {
        setForm(prev => ({ ...prev, ...updates }));
      }
    };
    
    restoreFiles();
  }, []);



  const SuccessOverlay = () => {
    if (!publishedProfile) return null;
    const url = `${window.location.origin}/p/${publishedProfile.slug}`;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative bg-white rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-gradient-x" />

          <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-green-100 rounded-full"
            />
            <Check className="h-10 w-10 text-green-600 relative z-10" />
          </div>

          <h2 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">Your profile is live 🎉</h2>
          <p className="text-zinc-500 font-medium mt-4">It's beautiful. You can start sharing it now or head to the editor for final touches.</p>

          <div className="mt-10 p-2 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-2">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile Link</span>
              <span className="text-xs font-bold text-zinc-900 truncate max-w-[180px] ml-4">{url}</span>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
              }}
              className="w-full h-14 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-zinc-950/20 active:scale-95"
            >
              Copy Link
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => window.open(url, '_blank')}
              className="h-14 border-zinc-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50"
            >
              View Profile
            </Button>
            <Button
              onClick={() => navigate(`/dashboard`)}
              className="h-14 bg-white text-zinc-950 border-2 border-zinc-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-950 hover:text-white transition-all"
            >
              Enter Editor
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  const handleFileChange = async (field: 'logo' | 'cover', file: File | null) => {
    if (!file) return;
    
    // Immediately show the local uncompressed preview for fast feedback
    const localPreview = URL.createObjectURL(file);
    updateForm({ [field]: file, [`${field}_preview`]: localPreview } as Partial<FormData>);

    try {
      // Compress in background and convert to WebP
      const isLogo = field === 'logo';
      const maxDim = isLogo ? 800 : 1600;
      const compressedFile = await compressAndConvertToWebP(file, maxDim, 0.85);

      // Save the compressed file in state
      updateForm({ [field]: compressedFile, [`${field}_preview`]: URL.createObjectURL(compressedFile) } as Partial<FormData>);

      // Save Base64 representation to sessionStorage to persist across redirects (e.g. Google login)
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          sessionStorage.setItem(`wizard_${field}_base64`, reader.result as string);
        } catch (storageError) {
          console.warn(`sessionStorage quota exceeded when storing ${field} base64:`, storageError);
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Error compressing file:", err);
      // Fallback: convert original file to Base64 (ignoring errors if it's too large)
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          sessionStorage.setItem(`wizard_${field}_base64`, reader.result as string);
        } catch (storageError) {
          console.warn(`sessionStorage quota exceeded when storing original ${field} base64:`, storageError);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    // Automatically compress logo/cover image to WebP
    const isLogo = path.includes('/logo-');
    const maxDim = isLogo ? 800 : 1600;
    const compressedFile = await compressAndConvertToWebP(file, maxDim, 0.85);

    // Ensure suffix ends in .webp
    const fullPath = path.endsWith('.webp') ? path : `${path}.webp`;

    const { data, error } = await supabase.storage
      .from('profile-assets')
      .upload(fullPath, compressedFile, { upsert: true, contentType: 'image/webp' });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const generateSlug = (name: string) => {
    return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6);
  };

  const doPublish = useCallback(async (publishingUser: User) => {
    const currentForm = formRef.current;
    setPublishing(true);
    try {
      const slug = generateSlug(currentForm.brand_name || '');

      // 1. Upload Logo & Cover
      let logo_url: string | null = null;
      let cover_image_url: string | null = null;

      let logoFile = currentForm.logo;
      let coverFile = currentForm.cover;

      // Restore files from sessionStorage if they are missing (e.g. after Google auth redirect)
      if (!logoFile) {
        const logoBase64 = sessionStorage.getItem('wizard_logo_base64');
        if (logoBase64) {
          try {
            const res = await fetch(logoBase64);
            const blob = await res.blob();
            logoFile = new File([blob], 'logo.webp', { type: 'image/webp' });
          } catch (e) {
            console.error("Error reconstructing logo from session storage:", e);
          }
        }
      }

      if (!coverFile) {
        const coverBase64 = sessionStorage.getItem('wizard_cover_base64');
        if (coverBase64) {
          try {
            const res = await fetch(coverBase64);
            const blob = await res.blob();
            coverFile = new File([blob], 'cover.webp', { type: 'image/webp' });
          } catch (e) {
            console.error("Error reconstructing cover from session storage:", e);
          }
        }
      }

      if (logoFile) {
        logo_url = await uploadFile(logoFile, `${publishingUser.id}/${slug}/logo-${Date.now()}`);
      }
      if (coverFile) {
        cover_image_url = await uploadFile(coverFile, `${publishingUser.id}/${slug}/cover-${Date.now()}`);
      }

      const themeValue = currentForm.theme === 'custom'
        ? encodeCustomTheme({
          bg: currentForm.custom_bg, text: currentForm.custom_text, muted: currentForm.custom_muted,
          cardBg: currentForm.custom_card_bg, btnBg: currentForm.custom_btn_bg, btnText: currentForm.custom_btn_text,
        })
        : currentForm.theme;

      // 2. Insert Profile
      const { data: profile, error: profileError } = await supabase.from('profiles').insert({
        user_id: publishingUser.id,
        brand_name: currentForm.brand_name,
        slug,
        category: currentForm.category,
        theme: themeValue,
        layout: currentForm.layout,
        tagline: currentForm.tagline,
        description: currentForm.description,
        phone: currentForm.phone,
        whatsapp: currentForm.whatsapp,
        instagram: currentForm.instagram,
        facebook: currentForm.facebook,
        linkedin: currentForm.linkedin,
        twitter: currentForm.twitter,
        youtube: currentForm.youtube,
        tiktok: currentForm.tiktok,
        website: currentForm.website,
        email: currentForm.email,
        google_review: currentForm.google_review,
        location: currentForm.location,
        address: currentForm.address,
        logo_url,
        cover_image_url,
        lead_form_enabled: currentForm.lead_form_enabled,
        lead_form_title: currentForm.lead_form_title,
        vision: currentForm.custom_link_label,
        mission: currentForm.custom_link_url,
        products: null
      }).select().single();

      if (profileError) throw profileError;

      setPublishedProfile({ id: profile.id, slug: profile.slug });
      setShowSuccess(true);
      setShowAuthModal(false);
      sessionStorage.removeItem('wizard_form');
      sessionStorage.removeItem('wizard_step');
      sessionStorage.removeItem('wizard_logo_base64');
      sessionStorage.removeItem('wizard_cover_base64');
      toast.success('Profile published!');
    } catch (err) {
      const error = err as Error;
      console.error("Publishing error:", error);
      toast.error(error.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  }, [navigate]);

  // Redirect logic: if user is logged in AND has an existing profile → go to Dashboard
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user || authLoading) return;

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((count || 0) >= 1) {
        navigate('/dashboard');
      } else {
        // If they don't have a profile but they just returned from Google Auth, auto publish!
        const autoPublish = sessionStorage.getItem('auto_publish_pending');
        if (autoPublish === 'true') {
          sessionStorage.removeItem('auto_publish_pending');
          doPublish(user);
        }
      }
    };
    checkExistingProfile();
  }, [user, authLoading, navigate, doPublish]);

  const handlePublish = () => {
    if (user) {
      // Already logged in → publish directly
      doPublish(user);
    } else {
      // Not logged in → show auth modal
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = useCallback((authenticatedUser: User) => {
    setShowAuthModal(false);
    doPublish(authenticatedUser);
  }, [doPublish]);

  const canProceed = () => {
    switch (step) {
      case 0:
        return (form.brand_name || '').trim() !== '' &&
          (form.category || '') !== '' &&
          (!isOtherSelected || ((otherCategory || '').trim() !== ''));
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      // STEP 0: Brand & Category
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-900">Let's build your profile</h1>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                Start with your brand name and category. You'll be live in minutes.
              </p>
            </div>

            {/* Brand Name - Prominent */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Brand Name *</Label>
              <Input
                value={form.brand_name}
                onChange={e => updateForm({ brand_name: e.target.value })}
                placeholder="Your brand or business name"
                autoFocus
                className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 transition-all text-lg font-medium"
              />
            </div>

            {/* Category Grid */}
            <div>
              <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider mb-3 block">Category *</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === 'Other') {
                        setIsOtherSelected(true);
                        updateForm({ category: otherCategory || '' });
                      } else {
                        setIsOtherSelected(false);
                        updateForm({ category: cat.id });
                      }
                    }}
                    className={`group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 border-2 ${(cat.id === 'Other' ? isOtherSelected : (!isOtherSelected && form.category === cat.id))
                        ? 'bg-white border-orange-500 shadow-2xl shadow-orange-500/20 scale-[1.05] z-10'
                        : 'bg-white border-zinc-100 hover:border-orange-200 hover:shadow-lg'
                      }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-all duration-500 ${(cat.id === 'Other' ? isOtherSelected : (!isOtherSelected && form.category === cat.id))
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg rotate-3'
                          : 'bg-zinc-50 group-hover:bg-orange-50 group-hover:scale-110 group-hover:-rotate-3'
                        }`}>
                        {cat.icon}
                      </div>

                      <div className="space-y-1.5">
                        <span className={`text-[12px] font-extrabold transition-colors tracking-tight leading-tight block ${(cat.id === 'Other' ? isOtherSelected : (!isOtherSelected && form.category === cat.id)) ? 'text-orange-600' : 'text-zinc-800'
                          }`}>
                          {cat.label}
                        </span>
                        {cat.popular && (
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${(cat.id === 'Other' ? isOtherSelected : (!isOtherSelected && form.category === cat.id))
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-orange-100 text-orange-600'
                              }`}>
                              Popular
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(cat.id === 'Other' ? isOtherSelected : (!isOtherSelected && form.category === cat.id)) && (
                      <motion.div
                        layoutId="active-bg"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 pointer-events-none"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isOtherSelected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Specify Category</Label>
                <Input
                  placeholder="e.g. Photographer, Consultant, etc."
                  value={otherCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOtherCategory(val);
                    updateForm({ category: val });
                  }}
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:border-orange-500 focus:ring-orange-500/10 transition-all font-medium"
                  autoFocus
                />
              </motion.div>
            )}
          </div>
        );

      // STEP 1: Identity (Logo, Tagline, Cover)
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-zinc-900">Brand Identity</h2>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                Add your logo and tagline. Everything here is optional — you can always update later.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-zinc-600">Logo</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                    {form.logo_preview ? (
                      <img src={form.logo_preview} alt="" className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-3xl">📸</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input type="file" accept="image/*" onChange={e => handleFileChange('logo', e.target.files?.[0] ?? null)} className="text-sm" />
                    <p className="text-[11px] text-zinc-400 mt-1">Square image works best</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-600">Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={e => updateForm({ tagline: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white"
                  placeholder="A short catchy line about your brand"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-600">Cover Image</Label>
                <Input type="file" accept="image/*" onChange={e => handleFileChange('cover', e.target.files?.[0] ?? null)} className="mt-1.5" />
                {form.cover_preview && <img src={form.cover_preview} alt="" className="mt-2 h-24 w-full rounded-xl object-cover" />}
                <p className="text-[11px] text-zinc-400 mt-1">A banner image for the top of your profile</p>
              </div>
            </div>
          </div>
        );

      // STEP 2: Contact
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-zinc-900">How to Reach You</h2>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                Add your contact details. All fields are optional — add what matters most.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Phone', key: 'phone', placeholder: '+1234567890' },
                  { label: 'WhatsApp', key: 'whatsapp', placeholder: '+1234567890' },
                  { label: 'Email', key: 'email', placeholder: 'your@email.com' },
                  { label: 'Website', key: 'website', placeholder: 'https://yourwebsite.com' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-zinc-600">{f.label}</Label>
                      {f.key === 'whatsapp' && form.phone && !form.whatsapp && (
                        <button
                          onClick={() => updateForm({ whatsapp: form.phone })}
                          className="text-[10px] text-orange-600 font-bold hover:text-orange-700 transition-colors bg-orange-50 px-2 py-0.5 rounded-full"
                        >
                          Same as Phone?
                        </button>
                      )}
                    </div>
                    <Input
                      value={form[f.key as keyof FormData] as string}
                      onChange={e => updateForm({ [f.key]: e.target.value })}
                      className="bg-zinc-50 border-zinc-100 focus:bg-white h-12 rounded-xl"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // STEP 3: Design (Layout + Theme combined)
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-zinc-900">Pick Your Look</h2>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                Choose a layout and theme for your profile. You can change these anytime.
              </p>
            </div>

            {/* Layout Selection */}
            <div>
              <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider mb-3 block flex items-center gap-2">
                <Layout className="h-3.5 w-3.5 text-orange-500" /> Layout
              </Label>
              <div className="space-y-2">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => updateForm({ layout: l.id })}
                    className={`w-full rounded-xl p-4 text-left transition-all border-2 ${form.layout === l.id
                        ? 'border-orange-500 bg-orange-50 shadow-sm'
                        : 'border-zinc-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                      }`}
                  >
                    <span className={`text-sm font-bold ${form.layout === l.id ? 'text-orange-600' : 'text-zinc-800'}`}>{l.label}</span>
                    <p className="mt-0.5 text-xs text-zinc-500">{l.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <Label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider mb-3 block flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-orange-500" /> Theme
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEMES.filter(t => t.id !== 'custom').slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateForm({ theme: t.id })}
                    className={`w-full flex flex-col p-3 rounded-xl border-2 transition-all relative ${form.theme === t.id ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-transparent bg-zinc-50 hover:bg-zinc-100'
                      }`}
                  >
                    <div className={`w-full h-10 rounded-lg mb-2 ${t.colors} border border-black/5 shadow-sm`} />
                    <span className={`text-[11px] font-bold ${form.theme === t.id ? 'text-orange-600' : 'text-zinc-600'}`}>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <Select
                  value={THEMES.filter(t => t.id !== 'custom').slice(0, 4).some(t => t.id === form.theme) ? "" : form.theme}
                  onValueChange={(val) => updateForm({ theme: val })}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl bg-white border-zinc-200 text-[10px] font-black uppercase tracking-widest ring-offset-background focus:ring-orange-500 hover:border-orange-500/50 hover:bg-orange-50/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-orange-500" />
                      <SelectValue placeholder="Explore More Themes..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl">
                    {THEMES.filter(t => t.id !== 'custom').slice(4).map(t => {
                      const isLocked = planTier === 'basic' && !user;
                      return (
                        <SelectItem key={t.id} value={t.id} className="py-4 focus:bg-orange-50 focus:text-orange-600 rounded-xl m-1">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-14 rounded-md shadow-sm border border-black/5 ${t.colors}`} />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{t.label}</span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      // STEP 4: Preview & Publish
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-zinc-900">Preview & Publish</h2>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                Here's how your profile looks. Ready? Hit publish to go live!
              </p>
            </div>

            <div className="mx-auto max-w-sm rounded-2xl border border-border overflow-hidden shadow-lg">
              <ProfilePreview form={form} />
            </div>

            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 rounded-2xl font-bold text-lg hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-70"
              size="lg"
            >
              {publishing ? 'Publishing...' : '🚀 Publish My Profile'}
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[2rem] bg-[#0A0A0A] p-[2px] shadow-2xl shadow-zinc-950/20 mx-auto max-w-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-20" />

              <div className="relative h-full w-full rounded-[1.8rem] bg-[#0A0A0A] p-6 text-left overflow-hidden">
                <div className="absolute -right-10 -top-10 h-32 w-32 bg-orange-500/30 blur-[40px] rounded-full" />
                <div className="absolute -left-10 -bottom-10 h-32 w-32 bg-amber-500/30 blur-[40px] rounded-full" />

                <div className="relative z-10 flex flex-col items-center sm:items-start sm:flex-row gap-5">
                  <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-orange-500/20 ring-1 ring-white/10">
                    <Zap className="h-6 w-6 text-white" />
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h3 className="text-sm font-black tracking-wide text-white uppercase">
                      Supercharge Your Profile
                    </h3>
                    <p className="text-[13px] text-zinc-400 leading-relaxed font-medium">
                      After publishing, open <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded-md">Manage Profile</strong> to unlock deep customizations, media, social links, and more!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  if (authLoading) {
    return <PremiumLoader fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {showSuccess && <SuccessOverlay />}

      <InlineAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <nav className="bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-lg px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 h-14 rounded-2xl font-bold">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 border-0 h-14 rounded-2xl font-bold text-lg hover:opacity-90 hover:scale-[1.01] transition-all disabled:opacity-70"
            >
              {step === 0 ? 'Build My Profile' : 'Next'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateProfile;
