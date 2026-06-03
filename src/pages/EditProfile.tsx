import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Plus, X, Image as ImageIcon, 
  Smartphone, Globe, Palette, Layout, Link as LinkIcon,
  Trash2, ExternalLink, QrCode, Share2, Crown, Info,
  Settings, User, Star, Camera, Check, ChevronRight, TrendingUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getThemeClasses, encodeCustomTheme, parseCustomTheme, getThemeColors } from '@/lib/themes';
import { LAYOUTS } from '@/lib/layouts';
import { PremiumLoader } from '@/components/PremiumLoader';
import ProfilePreview from '@/components/ProfilePreview';
import { compressAndConvertToWebP } from '@/lib/images';

const THEMES = [
  { id: 'minimal',  label: 'Minimal',  colors: 'bg-white border border-gray-200' },
  { id: 'dark',     label: 'Dark',     colors: 'bg-[#0f172a]' },
  { id: 'luxury',   label: 'Luxury',   colors: 'bg-gradient-to-br from-amber-900 to-amber-700' },
  { id: 'modern',   label: 'Modern',   colors: 'bg-gradient-to-br from-blue-600 to-purple-600' },
  { id: 'colorful', label: 'Colorful', colors: 'bg-gradient-to-br from-pink-500 to-yellow-500' },
  { id: 'ocean',    label: 'Ocean',    colors: 'bg-gradient-to-br from-sky-900 to-cyan-800' },
  { id: 'forest',   label: 'Forest',   colors: 'bg-gradient-to-br from-green-900 to-green-700' },
  { id: 'sunset',   label: 'Sunset',   colors: 'bg-gradient-to-br from-zinc-900 to-red-700' },
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

const LEAD_TITLES = [
  'Enquiry', 'Support', 'Book Appointment', 'More Details', 'Get Quote', 'Contact Us'
];

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

interface Product {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  image?: File;
  preview?: string;
}

interface ProfileMedia {
  id: string;
  media_url: string;
}

const EditProfile = ({ passedId, forcedTab, embedded = false }: { passedId?: string, forcedTab?: string, embedded?: boolean }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = passedId || paramId;
  const navigate = useNavigate();
  const { user, planTier } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(forcedTab || searchParams.get('tab') || 'identity');

  useEffect(() => {
    if (forcedTab) setActiveTab(forcedTab);
  }, [forcedTab]);
  const offeringsEndRef = useRef<HTMLDivElement>(null);
  
  const [form, setForm] = useState({
    brand_name: '', tagline: '', description: '', category: '', theme: 'minimal', layout: 'classic',
    phone: '', whatsapp: '', instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '', tiktok: '', website: '', email: '', google_review: '',
    location: '', address: '', logo_url: '', cover_image_url: '', lead_form_enabled: false, lead_form_title: 'Enquiry',
    hide_watermark: false, is_premium: false,
    custom_bg: '#ffffff', custom_text: '#0f172a', custom_muted: '#64748b',
    custom_card_bg: '#f8fafc', custom_btn_bg: '#0f172a', custom_btn_text: '#ffffff',
    custom_link_label: '', custom_link_url: '',
    custom_links: [] as { id: string, name: string, url: string }[],
    products: [] as Product[],
    logo_preview: '',
    cover_preview: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState('');
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [newCover, setNewCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  
  const [existingMedia, setExistingMedia] = useState<ProfileMedia[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        toast.error('Error fetching profile');
        navigate('/dashboard');
        return;
      }
      setForm({ ...form, ...data, products: data.products || [], custom_links: data.custom_links || [], custom_link_label: data.vision, custom_link_url: data.mission });
      setSlug(data.slug);
      setLogoPreview(data.logo_url);
      setCoverPreview(data.cover_image_url);
      try {
        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('profile_id', id);
        if (mediaData) setExistingMedia(mediaData);
      } catch (err) {
        console.warn("Secondary data fetch error:", err);
      }

      setLoading(false);
    };
    fetchProfile();
  }, [id, navigate]);

  const updateForm = (updates: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...updates }));
    setIsSaved(false);
  };

  const getActiveLinksCount = (currentForm: typeof form) => {
    const linkFields = [
      'phone', 'whatsapp', 'google_review', 'website', 'email',
      'instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok'
    ];
    return linkFields.filter(field => (currentForm[field as keyof typeof form] as string || '').trim() !== '').length;
  };

  const handleLinkChange = (field: string, value: string) => {
    const isBasic = planTier !== 'premium';
    if (isBasic && value.trim() !== '') {
      const currentValue = (form[field as keyof typeof form] as string || '').trim();
      if (currentValue === '') {
        const activeCount = getActiveLinksCount(form);
        if (activeCount >= 4) {
          toast.error("Basic plan is limited to at most 4 contact/social links. Please upgrade to add more!");
          navigate('/pricing');
          return;
        }
      }
    }
    updateForm({ [field]: value });
  };

  const handleAddOffering = () => {
    updateForm({
      products: [
        ...form.products,
        { id: Math.random().toString(36).substr(2, 9), title: '', description: '', preview: '' }
      ]
    });
    setTimeout(() => {
      offeringsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleToggleWatermark = () => {
    if (planTier !== 'premium') {
      toast.error("Remove Watermark is a Premium plan feature. Please upgrade to unlock.");
      navigate('/pricing');
      return;
    }
    updateForm({ hide_watermark: !form.hide_watermark });
  };

  const handleSave = async () => {
    if (planTier !== 'premium') {
      const activeCount = getActiveLinksCount(form);
      if (activeCount > 4) {
        toast.error("Basic plan is limited to at most 4 contact/social links. Please remove some links before saving.");
        return;
      }
    }

    setSaving(true);
    try {
      let logo_url = form.logo_url;
      if (newLogo) {
        const compressedLogo = await compressAndConvertToWebP(newLogo, 800, 0.85);
        const path = `${user?.id}/${id}/logo-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('profile-assets').upload(path, compressedLogo, { upsert: true, contentType: 'image/webp' });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('profile-assets').getPublicUrl(path);
        logo_url = publicUrl;
      }

      let cover_image_url = form.cover_image_url;
      if (newCover) {
        const compressedCover = await compressAndConvertToWebP(newCover, 1600, 0.85);
        const path = `${user?.id}/${id}/cover-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('profile-assets').upload(path, compressedCover, { upsert: true, contentType: 'image/webp' });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('profile-assets').getPublicUrl(path);
        cover_image_url = publicUrl;
      }

      // Process and prepare products array with uploaded images
      const processedProducts = [];
      for (const prod of form.products) {
        let p_url = prod.image_url;
        if (prod.image) {
          const compressedProd = await compressAndConvertToWebP(prod.image, 1200, 0.85);
          const path = `${user?.id}/${id}/product-${prod.id}-${Date.now()}.webp`;
          const { error: pUploadError } = await supabase.storage.from('profile-assets').upload(path, compressedProd, { upsert: true, contentType: 'image/webp' });
          if (pUploadError) throw pUploadError;
          const { data: { publicUrl } } = supabase.storage.from('profile-assets').getPublicUrl(path);
          p_url = publicUrl;
        }
        processedProducts.push({
          id: prod.id,
          title: prod.title,
          description: prod.description,
          image_url: p_url
        });
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          brand_name: form.brand_name,
          tagline: form.tagline,
          description: form.description,
          category: form.category,
          theme: form.theme,
          layout: form.layout,
          phone: form.phone,
          whatsapp: form.whatsapp,
          instagram: form.instagram,
          facebook: form.facebook,
          linkedin: form.linkedin,
          twitter: form.twitter,
          youtube: form.youtube,
          tiktok: form.tiktok,
          website: form.website,
          email: form.email,
          google_review: form.google_review,
          location: form.location,
          address: form.address,
          logo_url,
          cover_image_url,
          lead_form_enabled: form.lead_form_enabled,
          lead_form_title: form.lead_form_title,
          hide_watermark: planTier === 'premium' ? form.hide_watermark : false,
          vision: form.custom_link_label,
          mission: form.custom_link_url,
          custom_links: form.custom_links,
          products: processedProducts,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Handle deleted media
      if (deletedMediaIds.length > 0) {
        const { error: deleteError } = await supabase.from('media').delete().in('id', deletedMediaIds);
        if (deleteError) throw deleteError;
      }

      // Handle new media
      for (const file of newMediaFiles) {
        const compressedMedia = await compressAndConvertToWebP(file, 1600, 0.85);
        const path = `${user?.id}/${id}/media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.webp`;
        const { error: uploadError } = await supabase.storage.from('profile-assets').upload(path, compressedMedia, { upsert: true, contentType: 'image/webp' });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('profile-assets').getPublicUrl(path);
        const { error: insertError } = await supabase.from('media').insert({ profile_id: id, media_type: 'image', media_url: publicUrl });
        if (insertError) throw insertError;
      }

      // Update form state with the new remote URLs and clean product objects
      setForm(prev => ({
        ...prev,
        logo_url,
        cover_image_url,
        products: processedProducts
      }));
      setLogoPreview(logo_url);
      setCoverPreview(cover_image_url);
      setNewLogo(null);
      setNewCover(null);
      setNewMediaFiles([]);
      setNewMediaPreviews([]);
      setDeletedMediaIds([]);

      // Re-fetch media to update the gallery state correctly
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('profile_id', id);
      if (mediaError) throw mediaError;
      if (mediaData) setExistingMedia(mediaData);

      toast.success('Profile updated successfully');
      setIsSaved(true);
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast.error('Error deleting profile');
    } else {
      toast.success('Profile deleted');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <PremiumLoader fullScreen={!embedded} />;
  }

  const TABS = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'connect', label: 'Connect', icon: Globe },
    { id: 'tools', label: 'Tools', icon: Plus },
    { id: 'design', label: 'Design', icon: Star },
  ];

  return (
    <div className="w-full h-full bg-white sm:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-36 sm:py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">

            <div className="min-w-0 text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">{form.brand_name || 'Edit Profile'}</h1>
              <p className="text-sm text-zinc-500 mt-1">Make changes to your public profile.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
              <Button 
                onClick={() => handleSave()} 
                disabled={saving}
                className={`text-white rounded-lg h-10 px-6 font-semibold transition-all shadow-sm ${
                  isSaved 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 border-0"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="h-4 w-4 sm:mr-2" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="inline sm:hidden">Save</span>
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
              <div className="pt-2 min-h-[400px]">

                <AnimatePresence mode="wait">
                  {activeTab === 'identity' && (
                    <motion.div key="identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5" >
                       <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Brand Name</Label>
                            <Input value={form.brand_name} onChange={e => updateForm({ brand_name: e.target.value })} placeholder="e.g. Acme Corp" className="h-12 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tagline</Label>
                            <Input value={form.tagline} onChange={e => updateForm({ tagline: e.target.value })} placeholder="Your brand hook" className="h-12 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-zinc-200">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Category</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => updateForm({ category: cat.id })}
                                className={`relative group px-4 py-2.5 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                                  form.category === cat.id
                                    ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-md shadow-zinc-900/5 scale-[1.02] z-10'
                                    : 'border-zinc-100 bg-white text-zinc-600 hover:border-zinc-300'
                                }`}
                              >
                                {cat.popular && (
                                  <div className={`absolute -top-2 -right-1 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${
                                    form.category === cat.id ? 'bg-orange-500 text-white' : 'bg-zinc-950 text-white'
                                  }`}>
                                    Popular
                                  </div>
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-tight leading-tight transition-colors ${
                                  form.category === cat.id ? 'text-zinc-900' : 'text-zinc-600 group-hover:text-zinc-900'
                                }`}>
                                  {cat.label}
                                </span>
                              </button>
                            ))}
                          </div>
                          {(form.category === 'Other' || !CATEGORIES.some(c => c.id === form.category)) && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                              <Label className="text-[9px] font-bold text-zinc-900 uppercase mb-1.5 block ml-1">Custom Industry Name</Label>
                              <Input 
                                value={form.category === 'Other' ? '' : form.category} 
                                onChange={e => updateForm({ category: e.target.value })} 
                                placeholder="Type your industry..." 
                                className="h-11 bg-white border-2 border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl font-bold text-sm placeholder:text-zinc-300" 
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 pt-3 border-t border-zinc-200">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">About</Label>
                          <Textarea value={form.description} onChange={e => updateForm({ description: e.target.value })} placeholder="Tell your story..." className="min-h-[140px] bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-2xl p-4 text-sm resize-none" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'design' && (
                    <motion.div key="design" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                       <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 space-y-6">
                         <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Select Layout</Label>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                             {LAYOUTS.map((layout) => (
                               <button
                                 key={layout.id}
                                 onClick={() => updateForm({ layout: layout.id })}
                                 className={`relative group p-4 rounded-xl border-2 transition-all text-left ${
                                   form.layout === layout.id
                                     ? 'border-orange-500 bg-zinc-100 shadow-xl shadow-zinc-900/10'
                                     : 'border-zinc-100 bg-white hover:border-zinc-300'
                                 }`}
                               >
                                 <div className="flex flex-col gap-1">
                                   <div>
                                     <h4 className={`text-sm font-bold tracking-tight ${form.layout === layout.id ? 'text-zinc-900' : 'text-zinc-900'}`}>{layout.label}</h4>
                                     <p className={`text-[10px] font-medium leading-relaxed ${form.layout === layout.id ? 'text-zinc-500' : 'text-zinc-400'}`}>{layout.description}</p>
                                   </div>
                                 </div>
                                 {form.layout === layout.id && (
                                   <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg animate-in zoom-in">
                                     <Check className="h-3 w-3" />
                                   </div>
                                 )}
                               </button>
                             ))}
                           </div>
                         </div>

                         <div className="space-y-3 pt-4 border-t border-zinc-200">
                           <div className="flex items-center justify-between">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color Theme</Label>
                             <Button variant="ghost" size="sm" onClick={() => setThemesExpanded(!themesExpanded)} className="text-[10px] font-black uppercase tracking-tighter text-zinc-900">
                               {themesExpanded ? 'Show Less' : 'View All Themes'}
                               <ChevronRight className={`ml-1 h-3 w-3 transition-transform ${themesExpanded ? 'rotate-90' : ''}`} />
                             </Button>
                           </div>
                           <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                             {(themesExpanded ? THEMES : THEMES.slice(0, 5)).map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => updateForm({ theme: t.id })}
                                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                                   form.theme === t.id ? 'border-orange-500 ring-4 ring-zinc-900/10' : 'border-zinc-100'
                                  }`}
                                >
                                  <div className={`w-full h-full rounded-xl ${t.colors} flex items-end justify-center p-2`}>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md ${
                                      form.theme === t.id ? 'bg-orange-500 text-white' : 'bg-white/80 text-zinc-900 shadow-sm'
                                    }`}>
                                      {t.label}
                                    </span>
                                  </div>
                                  {form.theme === t.id && (
                                    <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-lg">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-5">
                            <button 
                              onClick={() => navigate(`/design-studio/${id}`)}
                              className="w-full group relative overflow-hidden rounded-xl sm:rounded-xl p-5 sm:p-8 transition-all hover:scale-[1.01] active:scale-[0.99] border border-zinc-200 shadow-xl shadow-zinc-900/5 bg-white"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-4 sm:gap-5">
                                  <div className="relative shrink-0">
                                     <div className="absolute inset-0 bg-purple-600 blur-xl opacity-20 animate-pulse" />
                                     <div className="relative p-3 sm:p-4 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/20">
                                        <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                     </div>
                                  </div>
                                  <div className="text-left">
                                     <h3 className="text-lg sm:text-xl font-bold text-zinc-950 leading-tight tracking-tight flex items-center gap-2">
                                        Design Studio
                                        {planTier !== 'premium' && <Crown className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />}
                                     </h3>
                                     <p className="text-[10px] sm:text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Professional Style Editor</p>
                                  </div>
                                </div>
                                <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 px-6 py-3 bg-white sm:bg-transparent border-2 border-dashed border-purple-500 text-zinc-900 rounded-2xl font-bold text-xs uppercase tracking-tight transition-all group-hover:gap-5 group-hover:bg-purple-600 group-hover:text-white group-hover:border-solid">
                                  {planTier === 'premium' ? 'Enter Studio' : 'Upgrade to Enter'}
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                  )}

                  {activeTab === 'media' && (
                    <motion.div key="media" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Profile Logo</Label>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-100 shadow-sm">
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 group ring-4 ring-zinc-50">
                                {logoPreview ? (
                                  <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <Camera className="h-6 w-6" />
                                  </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                  <Plus className="h-5 w-5 text-white" />
                                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const p = URL.createObjectURL(file);
                                        setNewLogo(file);
                                        setLogoPreview(p);
                                        updateForm({ logo_preview: p });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-tight text-zinc-950">Update Logo</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">SVG, PNG, JPG (Max 5MB)</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cover Image</Label>
                            <div className="relative h-[100px] rounded-xl overflow-hidden bg-white border border-zinc-100 group shadow-sm ring-4 ring-zinc-50">
                              {coverPreview ? (
                                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <ImageIcon className="h-8 w-8" />
                                </div>
                              )}
                              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                  <Camera className="h-6 w-6 text-white" />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Cover</span>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                    const file = e.target.files?.[0];
                                      if (file) {
                                        const p = URL.createObjectURL(file);
                                        setNewCover(file);
                                        setCoverPreview(p);
                                        updateForm({ cover_preview: p });
                                      }
                                    }}
                                  />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Media Gallery</Label>
                             {planTier === 'premium' && (
                               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{existingMedia.length + newMediaFiles.length} / 18</p>
                             )}
                          </div>
                          
                          {planTier !== 'premium' ? (
                            <div className="p-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="mx-auto bg-amber-50 text-amber-500 p-3 rounded-2xl w-12 h-12 flex items-center justify-center mb-3">
                                <Crown className="h-6 w-6 fill-current" />
                              </div>
                              <p className="text-sm font-extrabold text-zinc-900">Unlock Media Gallery</p>
                              <p className="text-xs font-medium text-zinc-500 mt-1 max-w-xs mx-auto">
                                Showcase multiple pictures of your products, store, or portfolio. Media gallery is a Premium feature.
                              </p>
                              <Button 
                                onClick={() => navigate('/pricing')}
                                className="mt-4 h-9 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider px-6"
                              >
                                Upgrade to Premium
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {existingMedia.map((media) => (
                                <div key={media.id} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group ring-2 ring-transparent hover:ring-zinc-900 transition-all">
                                  <img src={media.media_url} alt="" className="w-full h-full object-cover" />
                                  <button onClick={() => { setDeletedMediaIds(prev => [...prev, media.id]); setExistingMedia(prev => prev.filter(m => m.id !== media.id)); setIsSaved(false); }} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                              {newMediaPreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group ring-2 ring-zinc-900 ring-offset-2">
                                  <img src={preview} alt="" className="w-full h-full object-cover" />
                                  <button onClick={() => { setNewMediaFiles(prev => prev.filter((_, i) => i !== index)); setNewMediaPreviews(prev => prev.filter((_, i) => i !== index)); setIsSaved(false); }} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                              <label className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 hover:border-orange-500 hover:bg-zinc-100/30 transition-all flex flex-col items-center justify-center cursor-pointer bg-white group">
                                <Plus className="h-6 w-6 text-zinc-400 group-hover:text-zinc-900 group-hover:scale-110 transition-transform" />
                                <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                                  const files = Array.from(e.target.files || []);
                                  setNewMediaFiles(prev => [...prev, ...files]);
                                  setNewMediaPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                                  setIsSaved(false);
                                }} />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'connect' && (
                    <motion.div key="connect" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5" >
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 space-y-6">
                        {/* Primary Actions Group */}
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Quick Contact Actions</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Phone Number</p>
                              <Input value={form.phone} onChange={e => handleLinkChange('phone', e.target.value)} placeholder="+123..." className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">WhatsApp Number</p>
                              <Input value={form.whatsapp} onChange={e => handleLinkChange('whatsapp', e.target.value)} placeholder="+123..." className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Google Review Link</p>
                              <Input value={form.google_review} onChange={e => handleLinkChange('google_review', e.target.value)} placeholder="https://g.page/..." className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Website URL</p>
                              <Input value={form.website} onChange={e => handleLinkChange('website', e.target.value)} placeholder="https://..." className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Email Address</p>
                              <Input value={form.email} onChange={e => handleLinkChange('email', e.target.value)} placeholder="your@email.com" className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                          </div>
                        </div>

                        {/* Social Links Group */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Social Channels</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok'].map((f) => (
                              <div key={f} className="space-y-1.5">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">{f}</p>
                                <Input value={(form as any)[f]} onChange={e => handleLinkChange(f, e.target.value)} placeholder={`Your ${f}`} className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Custom Links Group */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Other Links</Label>
                            {planTier === 'premium' && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  updateForm({
                                    custom_links: [
                                      ...form.custom_links,
                                      { id: Math.random().toString(36).substr(2, 9), name: '', url: '' }
                                    ]
                                  });
                                }}
                                className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                              >
                                <Plus className="h-3 w-3" /> Add Link
                              </Button>
                            )}
                          </div>
                          
                          {planTier !== 'premium' ? (
                            <div className="p-5 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="mx-auto bg-amber-50 text-amber-500 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center mb-2.5">
                                <Crown className="h-5 w-5 fill-current" />
                              </div>
                              <p className="text-xs font-extrabold text-zinc-900">Unlock Custom Links</p>
                              <p className="text-[10px] font-medium text-zinc-500 mt-1 max-w-xs mx-auto">
                                Add customized links with custom titles for portfolios, shops, or any other web pages.
                              </p>
                              <Button 
                                onClick={() => navigate('/pricing')}
                                className="mt-3.5 h-8 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider px-4"
                              >
                                Upgrade to Premium
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {form.custom_links.map((link, index) => (
                                <div key={link.id} className="flex gap-2 items-start">
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                      <Input 
                                        value={link.name} 
                                        onChange={e => {
                                          const newLinks = [...form.custom_links];
                                          newLinks[index].name = e.target.value;
                                          updateForm({ custom_links: newLinks });
                                        }} 
                                        placeholder="Link Name (e.g. Portfolio)" 
                                        className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" 
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Input 
                                        value={link.url} 
                                        onChange={e => {
                                          const newLinks = [...form.custom_links];
                                          newLinks[index].url = e.target.value;
                                          updateForm({ custom_links: newLinks });
                                        }} 
                                        placeholder="https://..." 
                                        className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" 
                                      />
                                    </div>
                                  </div>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => {
                                      const newLinks = form.custom_links.filter((_, i) => i !== index);
                                      updateForm({ custom_links: newLinks });
                                    }}
                                    className="h-11 w-11 shrink-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {form.custom_links.length === 0 && (
                                <div className="p-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center">
                                  <p className="text-[11px] font-medium text-zinc-500">No custom links added yet. Click 'Add Link' to create one.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Location Group */}
                        <div className="space-y-3 pt-4 border-t border-zinc-200">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Location & Address</Label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Google Maps Link</p>
                              <Input value={form.location} onChange={e => updateForm({ location: e.target.value })} placeholder="Map URL" className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Display Address</p>
                                      <Input value={form.address} onChange={e => updateForm({ address: e.target.value })} placeholder="City, Country" className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" />
                            </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'tools' && (
                    <motion.div key="tools" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                      {planTier !== 'premium' ? (
                        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 text-center shadow-xl shadow-zinc-900/5 relative overflow-hidden group max-w-2xl mx-auto">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
                          <div className="mx-auto bg-amber-50 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 relative z-10">
                            <Crown className="h-10 w-10 fill-current animate-bounce" />
                          </div>
                          <h3 className="text-2xl font-black text-zinc-950 mb-3 relative z-10">Unlock Premium Tools Suite</h3>
                          <p className="text-zinc-500 font-medium max-w-md mx-auto mb-8 leading-relaxed relative z-10">
                            Take complete control of your profile. Upgrade to Premium to access:
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10 text-left relative z-10">
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-3">
                              <span className="text-xl">📊</span>
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase">Lead Capture Forms</p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Collect client name, email, and phone</p>
                              </div>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-3">
                              <span className="text-xl">🚀</span>
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase">Primary Action Button</p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Prominent high-priority CTA link</p>
                              </div>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-3">
                              <span className="text-xl">🛍</span>
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase">Services & Offerings</p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Showcase products with pricing and pictures</p>
                              </div>
                            </div>
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-3">
                              <span className="text-xl">✨</span>
                              <div>
                                <p className="text-xs font-black text-zinc-900 uppercase">Remove Watermark</p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Completely white-label your brand</p>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => navigate('/pricing')}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-10 py-6 rounded-full text-base shadow-[0_10px_25px_rgba(249,115,22,0.2)] hover:scale-105 transition-transform relative z-10"
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      ) : (
                        <>
                          {/* Lead Collection Card */}
                          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3.5">
                                <div className="p-3 bg-violet-50 rounded-2xl text-zinc-900">
                                  <User className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <Label className="text-sm sm:text-base font-extrabold text-zinc-950">Lead Collection Form</Label>
                                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Capture client enquiries</p>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => updateForm({ lead_form_enabled: !form.lead_form_enabled })}
                                className={`flex h-6 w-6 items-center justify-center rounded-xl border transition-all shrink-0 ${
                                  form.lead_form_enabled
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-zinc-900/25 scale-[1.03]'
                                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                                }`}
                              >
                                {form.lead_form_enabled && <Check className="h-4 w-4 stroke-[3]" />}
                              </button>
                            </div>

                            {form.lead_form_enabled && (
                              <div className="pt-4 border-t border-zinc-100 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                                <div className="space-y-2.5">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Form Type / Button Label</Label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {LEAD_TITLES.map(title => (
                                      <button
                                        key={title}
                                        type="button"
                                        onClick={() => updateForm({ lead_form_title: title })}
                                        className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                                          form.lead_form_title === title
                                            ? 'bg-zinc-100 text-zinc-900 border-orange-500 shadow-sm font-extrabold'
                                            : 'bg-white text-zinc-600 border-zinc-100 hover:border-zinc-400'
                                        }`}
                                      >
                                        {title}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Custom Label</Label>
                                  <Input 
                                    value={form.lead_form_title} 
                                    onChange={e => updateForm({ lead_form_title: e.target.value })} 
                                    placeholder="e.g. Request Callback" 
                                    className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Primary Action Button Card */}
                          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3.5">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                  <ExternalLink className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <Label className="text-sm sm:text-base font-extrabold text-zinc-950">Primary Action Button</Label>
                                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Most visible call to action</p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-wider shadow-sm">
                                High Priority
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Button Label</Label>
                                <Input 
                                  value={form.custom_link_label} 
                                  onChange={e => updateForm({ custom_link_label: e.target.value })} 
                                  placeholder="e.g. Book Appointment" 
                                  className="h-11 bg-white border-zinc-200 font-bold focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl font-bold" 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Destination URL</Label>
                                <Input 
                                  value={form.custom_link_url} 
                                  onChange={e => updateForm({ custom_link_url: e.target.value })} 
                                  placeholder="https://..." 
                                  className="h-11 bg-white border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl" 
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-[10.5px] text-amber-600 font-medium bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/30">
                              <Info className="h-4 w-4 shrink-0 text-amber-500" />
                              <p>This button appears prominently at the top of your profile to drive maximum conversions.</p>
                            </div>
                          </div>

                          {/* Offerings & Services Card */}
                          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 sm:p-6 space-y-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3.5">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                  <Layout className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <Label className="text-sm sm:text-base font-extrabold text-zinc-950">Offerings & Services</Label>
                                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Showcase products or portfolios</p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                type="button"
                                onClick={handleAddOffering} 
                                className="text-xs font-black bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-xl px-4 h-9 shadow-sm hover:bg-zinc-200 transition-all shrink-0" 
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add New
                              </Button>
                            </div>

                            <div className="space-y-4 pt-2">
                              {form.products.map((prod, index) => (
                                <div 
                                  key={prod.id} 
                                  className="relative rounded-2xl bg-white p-4 sm:p-5 border border-zinc-100 hover:border-zinc-300 transition-all shadow-sm"
                                >
                                  <button 
                                    type="button"
                                    onClick={() => updateForm({ products: form.products.filter((_, i) => i !== index) })} 
                                    className="absolute right-3.5 top-3.5 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="flex flex-row gap-4 items-start">
                                    {/* Image upload box */}
                                    <div className="shrink-0">
                                      <div className="relative aspect-square w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm group">
                                        {prod.preview || prod.image_url ? (
                                          <img src={prod.preview || prod.image_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                          </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                          <Camera className="h-4 w-4 text-white" />
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const np = [...form.products];
                                                np[index] = { ...np[index], image: file, preview: URL.createObjectURL(file) };
                                                updateForm({ products: np });
                                              }
                                            }} 
                                          />
                                        </label>
                                      </div>
                                      <p className="text-[8px] font-black uppercase text-zinc-400 tracking-wider text-center mt-1.5">Image</p>
                                    </div>

                                    {/* Details container */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                      <Input 
                                        value={prod.title} 
                                        onChange={e => { 
                                          const np = [...form.products]; 
                                          np[index] = { ...np[index], title: e.target.value }; 
                                          updateForm({ products: np }); 
                                        }} 
                                        placeholder="Offering Name / Title..." 
                                        className="h-10 bg-white border-zinc-200 font-bold focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl text-sm" 
                                      />
                                      <Textarea 
                                        value={prod.description} 
                                        onChange={e => { 
                                          const np = [...form.products]; 
                                          np[index] = { ...np[index], description: e.target.value }; 
                                          updateForm({ products: np }); 
                                        }} 
                                        placeholder="Describe your offering..." 
                                        className="min-h-[60px] bg-white border-zinc-200 text-xs focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 rounded-xl resize-none" 
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {form.products.length === 0 && (
                                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-zinc-200">
                                  <Layout className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                  <p className="text-xs text-zinc-400 font-bold">No offerings added yet</p>
                                  <p className="text-[10px] text-zinc-400 mt-1">Click "Add New" to showcase your services.</p>
                                </div>
                              )}
                              
                              <div ref={offeringsEndRef} />
                            </div>
                          </div>

                          {/* Remove Watermark Card */}
                          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3.5 text-left">
                                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                                  <Crown className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Label className="text-sm sm:text-base font-extrabold text-zinc-950">Remove Watermark</Label>
                                    {planTier !== 'premium' && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[8px] font-black text-amber-600 uppercase tracking-wider">
                                        Premium
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Hide "Powered by Portid" logo</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleToggleWatermark}
                                className={`flex h-6 w-6 items-center justify-center rounded-xl border transition-all shrink-0 ${
                                  form.hide_watermark
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-zinc-900/25 scale-[1.03]'
                                    : planTier !== 'premium'
                                      ? 'border-zinc-200 bg-zinc-100 cursor-not-allowed opacity-60'
                                      : 'border-zinc-200 bg-white hover:border-zinc-400'
                                }`}
                              >
                                {form.hide_watermark && <Check className="h-4 w-4 stroke-[3]" />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        
    </div>
  );
};

export default EditProfile;