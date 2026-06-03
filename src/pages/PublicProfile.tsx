import { PremiumLoader } from '@/components/PremiumLoader';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MessageCircle, Globe, MapPin, Star, Facebook, Instagram, UserPlus, Share2, Linkedin, Twitter, Youtube, Music2, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { getThemeClasses, parseCustomTheme } from '@/lib/themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Link as LinkIcon, ShoppingBag, Briefcase, Camera, Video, FileText, Github } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  primary_color?: string | null;
  secondary_color?: string | null;
  id: string;
  user_id: string;
  brand_name: string;
  slug: string;
  category: string | null;
  theme: string;
  layout: string;
  tagline: string | null;
  description: string | null;
  vision: string | null;
  mission: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  website?: string | null;
  email?: string | null;
  google_review?: string | null;
  location?: string | null;
  address?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  plan_tier?: 'basic' | 'premium';
  lead_form_enabled?: boolean;
  lead_form_title?: string;
  hide_watermark?: boolean;
  custom_links?: { id: string; name: string; url: string; }[] | null;
  products?: Product[] | null;
}

interface Product {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

interface Media {
  id: string;
  media_type: string;
  media_url: string;
}

const PublicProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-10">
      {/* Cover Image Shimmer */}
      <div className="h-44 sm:h-52 w-full bg-zinc-200/85 animate-pulse relative" />
      
      <div className="mx-auto max-w-md px-5">
        {/* Avatar Shimmer */}
        <div className="text-center -mt-12 relative z-10">
          <div className="mx-auto h-24 w-24 rounded-full border-4 border-white bg-zinc-200 animate-pulse shadow-md" />
          
          {/* Brand Name Shimmer */}
          <div className="h-7 w-48 bg-zinc-200 rounded-full mx-auto mt-5 animate-pulse" />
          {/* Tagline Shimmer */}
          <div className="h-4 w-64 bg-zinc-200 rounded-full mx-auto mt-2.5 animate-pulse" />
          {/* Category Badge Shimmer */}
          <div className="h-5 w-24 bg-zinc-200 rounded-full mx-auto mt-3 animate-pulse" />
        </div>

        {/* Primary Action Button Shimmer */}
        <div className="mt-6 flex justify-center">
          <div className="h-[54px] w-[216px] rounded-[18px] bg-zinc-200 animate-pulse shadow-sm" />
        </div>

        {/* Social Icons Shimmer Grid */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 px-1 max-w-[340px] mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[72px] aspect-square rounded-[20px] bg-zinc-200 animate-pulse border border-zinc-100/50" />
          ))}
        </div>

        {/* Secondary Action Buttons Shimmer (Save Contact / Share) */}
        <div className="mt-8 flex gap-3">
          <div className="flex-1 h-9 rounded-xl bg-zinc-200 animate-pulse" />
          <div className="flex-1 h-9 rounded-xl bg-zinc-200 animate-pulse" />
        </div>

        {/* Media Gallery Shimmer (Grid) */}
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square w-full bg-zinc-200 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Products / Services Shimmer */}
        <div className="mt-8">
          <div className="h-5 w-36 bg-zinc-200 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-100 bg-white p-2.5 space-y-2">
                <div className="aspect-square w-full bg-zinc-100 rounded-xl animate-pulse" />
                <div className="h-4 w-3/4 bg-zinc-200 rounded-full animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    requirement: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        // Parallelize secondary data fetching
        const [planRes, mediaRes] = await Promise.all([
          supabase.from('user_plans').select('plan_tier, expires_at').eq('user_id', data.user_id).maybeSingle(),
          supabase.from('media').select('*').eq('profile_id', data.id)
        ]);

        const expiresAt = planRes.data?.expires_at ? new Date(planRes.data.expires_at) : null;
        const isExpired = expiresAt && expiresAt < new Date();
        const activePlanTier = isExpired ? 'basic' : (planRes.data?.plan_tier || 'basic');

        setProfile({ ...data, plan_tier: activePlanTier } as Profile);
        setMedia(mediaRes.data ?? []);

        // Track view (Non-blocking)
        supabase.from('analytics').insert({
          profile_id: data.id,
          event_type: 'view',
        }).then(({ error: aErr }) => {
          if (aErr) console.warn("Analytics Error:", aErr);
        });
      } catch (err) {
        console.error("Public Profile Fetch Error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  const trackClick = async (buttonName: string) => {
    if (!profile) return;
    await supabase.from('analytics').insert({
      profile_id: profile.id,
      event_type: 'button_click',
      button_name: buttonName,
    });
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!leadData.name || (!leadData.phone && !leadData.email)) {
      toast.error('Please provide at least your name and a contact method (Phone or Email).');
      return;
    }

    setSubmittingLead(true);
    const { error } = await supabase.from('leads').insert({
      profile_id: profile.id,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      requirement: leadData.requirement
    });

    if (error) {
      toast.error('Failed to submit enquiry. Please try again.');
      setSubmittingLead(false);
      return;
    }

    toast.success('Enquiry sent successfully!');
    setLeadData({ name: '', email: '', phone: '', requirement: '' });
    setLeadFormOpen(false);
    setSubmittingLead(false);
    
    // Track as internal click
    trackClick(`lead_submit_${profile.lead_form_title || 'Enquiry'}`);
  };

  if (loading) {
    return <PublicProfileSkeleton />;
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">Profile Not Found</h1>
          <p className="mt-2 text-muted-foreground">This profile doesn't exist.</p>
        </div>
      </div>
    );
  }

  const theme = getThemeClasses(profile?.theme || 'minimal');
  const profileUrl = window.location.href;
  const layout = profile?.layout || 'classic';

  // Parse custom theme colors (stored as "custom:{...json...}" in the theme column)
  const customColors = parseCustomTheme(profile.theme);
  const customStyle = customColors
    ? { backgroundColor: customColors.bg, color: customColors.text }
    : undefined;
  const customCSS = customColors ? `
    .profile-ct .theme-muted { color: ${customColors.muted} !important; }
    .profile-ct .theme-card  { background-color: ${customColors.cardBg} !important; }
    .profile-ct .theme-btn   { background-color: ${customColors.btnBg} !important; color: ${customColors.btnText} !important; }
  ` : '';

  const getIconForName = (name: string) => {
    if (!name) return LinkIcon;
    const lower = name.toLowerCase();
    if (lower.includes('portfolio') || lower.includes('work') || lower.includes('behance') || lower.includes('dribbble')) return Briefcase;
    if (lower.includes('shop') || lower.includes('store') || lower.includes('buy') || lower.includes('cart')) return ShoppingBag;
    if (lower.includes('snapchat') || lower.includes('photo') || lower.includes('camera') || lower.includes('vsco')) return Camera;
    if (lower.includes('video') || lower.includes('vimeo') || lower.includes('twitch')) return Video;
    if (lower.includes('discord') || lower.includes('telegram') || lower.includes('chat') || lower.includes('messenger')) return MessageSquare;
    if (lower.includes('github') || lower.includes('code') || lower.includes('dev')) return Github;
    if (lower.includes('blog') || lower.includes('article') || lower.includes('medium') || lower.includes('substack')) return FileText;
    return LinkIcon;
  };

  const customActionButtons = (profile.custom_links || []).map(link => ({
    label: link.name || 'Link',
    icon: getIconForName(link.name),
    link: link.url,
    href: link.url.startsWith('http') ? link.url : `https://${link.url}`
  }));

  const actionButtons = [
    { label: 'Call', icon: Phone, link: profile.phone, href: `tel:${profile.phone}` },
    { label: 'WhatsApp', icon: MessageCircle, link: profile.whatsapp, href: `https://wa.me/${profile.whatsapp?.replace(/[^0-9]/g, '')}` },
    { label: 'Review', icon: Star, link: profile.google_review, href: profile.google_review },
    { label: 'Website', icon: Globe, link: profile.website, href: profile.website },
    { label: 'Email', icon: Mail, link: profile.email, href: profile.email ? `mailto:${profile.email}` : undefined },
    { label: 'Instagram', icon: Instagram, link: profile.instagram, href: profile.instagram },
    { label: 'Facebook', icon: Facebook, link: profile.facebook, href: profile.facebook },
    { label: 'LinkedIn', icon: Linkedin, link: profile.linkedin, href: profile.linkedin },
    { label: 'X', icon: Twitter, link: profile.twitter, href: profile.twitter },
    { label: 'YouTube', icon: Youtube, link: profile.youtube, href: profile.youtube },
    { label: 'TikTok', icon: Music2, link: profile.tiktok, href: profile.tiktok },
    { label: 'Location', icon: MapPin, link: profile.location, href: profile.location?.startsWith('http') ? profile.location : `https://maps.google.com/?q=${encodeURIComponent(profile.location || '')}` },
    ...customActionButtons
  ].filter(b => b.link);

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  const renderMedia = () => {
    if (images.length === 0 || profile?.plan_tier !== 'premium') return null;
    return (
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
          {images.map(img => (
            <img key={img.id} src={img.media_url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
          ))}
        </div>
      </div>
    );
  };

  const renderVideos = () => {
    if (videos.length === 0 || profile?.plan_tier !== 'premium') return null;
    return (
      <div className="mt-8">
        {videos.map(v => (
          <div key={v.id} className="mt-3">
            {v.media_url.includes('youtube') || v.media_url.includes('youtu.be') ? (
              <iframe
                src={v.media_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="aspect-video w-full rounded-xl"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video src={v.media_url} controls className="w-full rounded-xl" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderProducts = () => {
    if (!profile.products || profile.products.length === 0 || profile.plan_tier !== 'premium') return null;
    
    return (
      <div className="mt-8">
        <h3 className={`mb-4 text-center font-heading text-lg font-bold ${theme.text}`}>Products & Services</h3>
        <div className="grid grid-cols-2 gap-4">
          {profile.products.map((item: Product) => (
            <div 
              key={item.id} 
              className={`group overflow-hidden rounded-2xl border ${theme.cardBg} transition-all hover:scale-[1.02] shadow-xl shadow-black/20`}
            >
              <div className="aspect-square w-full overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  loading="lazy" 
                />
              </div>
              <div className="p-3 text-left">
                <h4 className="text-sm font-bold truncate leading-tight">{item.title}</h4>
                <p className={`mt-1 text-[10px] leading-relaxed line-clamp-2 ${theme.muted} opacity-70`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const downloadVCard = () => {
    if (!profile) return;
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.brand_name}
ORG:${profile.brand_name}
${profile.phone ? `TEL;TYPE=WORK,VOICE:${profile.phone}` : ''}
${profile.website ? `URL:${profile.website}` : ''}
${profile.address ? `ADR;TYPE=WORK,PREF:;;${profile.address.replace(/\n/g, ', ')};;;;` : ''}
${profile.description ? `NOTE:${profile.description}` : ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.brand_name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('vCard downloaded!');
  };

  const handleShare = async () => {
    const shareData = {
      title: profile?.brand_name,
      text: profile?.tagline || `Check out ${profile?.brand_name}'s profile`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const renderPrimaryAction = () => {
    if (!profile.vision || !profile.mission) return null;
    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-4 flex justify-center"
      >
        <a 
          href={profile.mission} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackClick(profile.vision || 'Primary Action')}
          className={`flex h-[54px] w-[216px] items-center justify-center gap-3 rounded-[18px] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.05] active:scale-95 border border-black/[0.03] ${theme.button}`}
        >
          <ExternalLink className="h-5 w-5" />
          {profile.vision}
        </a>
      </motion.div>
    );
  };

  const renderSecondaryActions = () => (
    <div className="mt-8 flex gap-3">
      <button
        onClick={downloadVCard}
        className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-medium transition-all border border-black/5 dark:border-white/5 ${theme.cardBg} ${theme.text} opacity-80 hover:opacity-100`}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Save Contact
      </button>
      <button
        onClick={handleShare}
        className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-medium transition-all border border-black/5 dark:border-white/5 ${theme.cardBg} ${theme.text} opacity-80 hover:opacity-100`}
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );

  const renderLeadButton = () => {
    if (!profile?.lead_form_enabled || profile?.plan_tier !== 'premium') return null;

    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Dialog open={leadFormOpen} onOpenChange={setLeadFormOpen}>
          <DialogTrigger asChild>
            <motion.button 
              drag
              dragMomentum={false}
              dragConstraints={{ top: -500, left: -300, right: 0, bottom: 0 }}
              initial={{ scale: 0, opacity: 0, y: 100, rotate: -15 }}
              animate={{ 
                scale: [0, 1.1, 1],
                opacity: 1, 
                y: 0,
                rotate: 0,
                boxShadow: [
                  "0 0 0px rgba(255,255,255,0)",
                  "0 0 20px rgba(255,255,255,0.3)",
                  "0 0 0px rgba(255,255,255,0)"
                ],
                transition: { 
                  duration: 0.6,
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }
              }}
              whileHover={{ 
                scale: 1.08, 
                boxShadow: "0 0 30px rgba(255,255,255,0.5)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all backdrop-blur-xl border border-white/20 shadow-2xl ${
                theme.button.includes('bg-white') 
                  ? 'bg-white/60 text-black' 
                  : 'bg-black/60 text-white'
              }`}
              onClick={() => trackClick(`lead_open_${profile.lead_form_title || 'Enquiry'}`)}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full mr-1 ${theme.button}`}>
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              {profile.lead_form_title || 'Enquiry'}
            </motion.button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl w-[90vw] p-6 z-[10000]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              {profile.lead_form_title || 'Enquiry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitLead} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name *</Label>
              <Input 
                id="lead-name" 
                placeholder="Full Name" 
                required 
                value={leadData.name}
                onChange={e => setLeadData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input 
                id="lead-email" 
                placeholder="your@email.com" 
                type="email" 
                value={leadData.email}
                onChange={e => setLeadData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input 
                id="lead-phone" 
                placeholder="+123..." 
                type="tel" 
                value={leadData.phone}
                onChange={e => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            {(profile.lead_form_title?.includes('Book') || profile.lead_form_title?.includes('Appointment') || profile.lead_form_title?.includes('Schedule')) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label>Preferred Date & Time</Label>
                <Input 
                  type="datetime-local" 
                  className="h-11 bg-zinc-50/50 border-zinc-200" 
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      setLeadData(prev => ({
                        ...prev,
                        requirement: `[Requested Date: ${new Date(val).toLocaleString()}]\n\n${prev.requirement.replace(/\[Requested Date: .*\]\n\n/, '')}`
                      }));
                    }
                  }}
                />
              </div>
            )}

            {(profile.lead_form_title?.includes('Book') || profile.lead_form_title?.includes('Appointment') || profile.lead_form_title?.includes('Schedule')) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 py-1">
                <Label className="text-xs">Preferred Date & Time</Label>
                <Input 
                  type="datetime-local" 
                  className="h-10 bg-zinc-50/50 border-zinc-200 text-xs" 
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      setLeadData(prev => ({
                        ...prev,
                        requirement: `[Requested Date: ${new Date(val).toLocaleString()}]\n\n${prev.requirement.replace(/\[Requested Date: .*\]\n\n/, '')}`
                      }));
                    }
                  }}
                />
              </div>
            )}

            {(profile.lead_form_title?.includes('Quote') || profile.lead_form_title?.includes('Details')) && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 py-1">
                 <div className="space-y-2">
                    <Label className="text-xs">Interested Service</Label>
                    <Input 
                      placeholder="e.g. Graphic Design" 
                      className="h-10 bg-zinc-50/50 border-zinc-200 text-xs"
                      onChange={e => {
                         const val = e.target.value;
                         setLeadData(prev => ({
                           ...prev,
                           requirement: `[Service: ${val}]\n${prev.requirement.replace(/\[Service: .*\]\n/, '')}`
                         }));
                      }}
                    />
                 </div>
                 {profile.lead_form_title?.includes('Quote') && (
                    <div className="space-y-2">
                      <Label className="text-xs">Approximate Budget</Label>
                      <Input 
                        placeholder="e.g. $500 - $1000" 
                        className="h-10 bg-zinc-50/50 border-zinc-200 text-xs"
                        onChange={e => {
                           const val = e.target.value;
                           setLeadData(prev => ({
                             ...prev,
                             requirement: `[Budget: ${val}]\n${prev.requirement.replace(/\[Budget: .*\]\n/, '')}`
                           }));
                        }}
                      />
                    </div>
                 )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="lead-req">Requirement / Message</Label>
              <Textarea 
                id="lead-req" 
                placeholder="How can we help you?" 
                rows={4} 
                value={leadData.requirement}
                onChange={e => setLeadData(prev => ({ ...prev, requirement: e.target.value }))}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-bold shadow-glow hover:bg-accent/90"
              disabled={submittingLead}
            >
              {submittingLead ? 'Sending...' : 'Submit enquiry'}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground opacity-60">
              By submitting, you agree to be contacted regarding this request.
            </p>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    );
  };

  const renderContactCard = () => {
    const hasContactInfo = profile.phone || profile.website || profile.email || profile.address;
    if (!hasContactInfo) return null;

    return (
      <div className={`mt-8 overflow-hidden rounded-2xl border ${theme.cardBg} p-5 shadow-lg shadow-black/5 transition-all hover:shadow-xl`}>
        <div className="space-y-4">
          {profile.phone && (
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
                <Phone className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Contact</p>
                <p className="text-sm font-semibold">{profile.phone}</p>
              </div>
            </div>
          )}
          {profile.website && (
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
                <Globe className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Website</p>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="block text-sm font-semibold truncate max-w-[180px]">
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
          {profile.email && (
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Email</p>
                <a href={`mailto:${profile.email}`} className="block text-sm font-semibold truncate max-w-[180px]">
                  {profile.email}
                </a>
              </div>
            </div>
          )}
          {profile.address && (
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Address</p>
                <p className="text-sm font-semibold leading-relaxed line-clamp-2">{profile.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (profile?.hide_watermark && profile?.plan_tier === 'premium') {
      return (
        <div className="mt-10 text-center">
          <button onClick={() => setShowQR(!showQR)} className={`text-xs ${theme.muted} hover:underline`}>
            {showQR ? 'Hide' : 'Show'} QR Code
          </button>
          {showQR && (
            <div className="mt-3 flex justify-center">
              <div className="rounded-xl bg-[#ffffff] p-4">
                <QRCodeSVG value={profileUrl} size={140} />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="mt-10 text-center">
          <button onClick={() => setShowQR(!showQR)} className={`text-xs ${theme.muted} hover:underline`}>
            {showQR ? 'Hide' : 'Show'} QR Code
          </button>
          {showQR && (
            <div className="mt-3 flex justify-center">
              <div className="rounded-xl bg-[#ffffff] p-4">
                <QRCodeSVG value={profileUrl} size={140} />
              </div>
            </div>
          )}
        </div>
        <div className="mt-12 pb-8 flex justify-center">
          <a href="https://portid.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 opacity-[0.15] hover:opacity-60 transition-opacity duration-500">
            <img src="/watermark.png" alt="" className="h-8 w-auto object-contain" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.muted}`}>Powered by Portid</span>
          </a>
        </div>
      </>
    );
  };

  const renderTopCornerWatermark = (customTopClass?: string) => {
    if (profile?.hide_watermark && profile?.plan_tier === 'premium') return null;

    return (
      <a 
        href="https://portid.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`absolute ${customTopClass || 'top-5 sm:top-6'} right-5 sm:right-6 z-50 mix-blend-difference opacity-60 hover:opacity-100 transition-opacity`}
      >
        {/* Because the watermark image is a white logo on a black square, mix-blend-difference 
            mathematically renders the black square invisible (B - 0 = B) and elegantly inverts 
            the white logo (B - 255) to be high-contrast against ANY underlying pixel. */}
        <img src="/watermark.png" alt="Portid" className="w-[42px] h-[42px] sm:w-[54px] sm:h-[54px] object-contain" />
      </a>
    );
  };

  // --- CLASSIC LAYOUT ---
  if (layout === 'classic') {
    return (
      <>
        {customCSS && <style>{customCSS}</style>}
        <title>{profile.brand_name} | Portid</title>
        <meta name="description" content={profile.tagline || profile.description || `${profile.brand_name} profile`} />
        {renderTopCornerWatermark()}
        <div
          className={`min-h-screen ${customColors ? 'profile-ct' : `${theme.bg} ${theme.text}`}`}
          style={customStyle}
        >
          {profile.cover_image_url && (
            <div className="h-44 w-full overflow-hidden">
              <img src={profile.cover_image_url} alt="" className="h-full w-full object-cover" fetchPriority="high" loading="eager" />
            </div>
          )}
          <div className="mx-auto max-w-md px-5 pb-10">
            <div className={`text-center ${profile.cover_image_url ? '-mt-12' : 'pt-10'}`}>
              {profile.logo_url && (
                <img src={profile.logo_url} alt={profile.brand_name} className="mx-auto h-24 w-24 rounded-full border-4 object-cover shadow-lg" style={{ borderColor: 'rgba(255,255,255,0.2)' }} fetchPriority="high" loading="eager" />
              )}
              <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">{profile.brand_name}</h1>
              {profile.tagline && <p className={`mt-1 text-sm ${theme.muted}`}>{profile.tagline}</p>}
              {profile.category && <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs ${theme.cardBg} ${theme.muted}`}>{profile.category}</span>}
            </div>
            {renderPrimaryAction()}
            {actionButtons.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-3 px-1 max-w-[340px] mx-auto">
                {actionButtons.map(b => (
                  <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(b.label)}
                    className={`flex flex-col items-center justify-center w-[72px] aspect-square rounded-[20px] transition-all active:scale-[0.98] border border-black/[0.03] ${theme.button}`}
                    title={b.label}
                  >
                    <b.icon className="h-5 w-5 mb-1" />
                    <span className="text-[7px] font-semibold uppercase tracking-[0.05em] truncate w-full px-1 text-center opacity-80">{b.label}</span>
                  </a>
                ))}
              </div>
            )}
            {renderSecondaryActions()}
            {renderMedia()}
            {renderVideos()}
            {renderProducts()}
            {renderContactCard()}
            {profile.description && (
              <div className="mt-8 text-center px-4">
                <p className={`text-sm leading-relaxed ${theme.muted}`}>{profile.description}</p>
              </div>
            )}
            {renderFooter()}
            {renderLeadButton()}
          </div>
        </div>
      </>
    );
  }

  // --- ELEGANT LAYOUT ---
  if (layout === 'elegant') {
    return (
      <>
        {customCSS && <style>{customCSS}</style>}
        <title>{profile.brand_name} | Portid</title>
        <meta name="description" content={profile.tagline || profile.description || `${profile.brand_name} profile`} />
        {renderTopCornerWatermark()}
        <div
          className={`min-h-screen ${customColors ? 'profile-ct' : `${theme.bg} ${theme.text}`}`}
          style={customStyle}
        >
          {profile.cover_image_url && (
            <div className="h-52 w-full overflow-hidden">
              <img src={profile.cover_image_url} alt="" className="h-full w-full object-cover" fetchPriority="high" loading="eager" />
            </div>
          )}
          <div className="mx-auto max-w-md px-5 pb-10">
            <div className={`rounded-3xl ${theme.cardBg} px-6 pb-6 text-center shadow-xl relative ${profile.cover_image_url ? 'mt-4' : 'mt-12'}`}>
              {profile.logo_url && (
                <div 
                  className={`mx-auto h-[104px] w-[104px] rounded-2xl p-1.5 shadow-sm ${theme.cardBg} ${profile.cover_image_url ? 'absolute -top-[52px] left-1/2 -translate-x-1/2' : '-mt-[52px]'}`}
                >
                  <img 
                    src={profile.logo_url} 
                    alt={profile.brand_name} 
                    className="h-full w-full rounded-xl object-cover shadow-lg" 
                    fetchPriority="high" 
                    loading="eager"
                  />
                </div>
              )}
              {/* Add top padding to the card content to make room for the absolute logo */}
              <div className={profile.logo_url ? 'pt-16' : 'pt-6'}>
                <h1 className="font-heading text-2xl font-semibold tracking-tight">{profile.brand_name}</h1>
                {profile.tagline && <p className={`mt-1 text-sm ${theme.muted}`}>{profile.tagline}</p>}
                {profile.category && <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs ${theme.muted}`}>{profile.category}</span>}
              </div>
            </div>
            {renderPrimaryAction()}
            {actionButtons.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-3 px-1 max-w-[340px] mx-auto">
                {actionButtons.map(b => (
                  <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(b.label)}
                    className={`flex flex-col items-center justify-center w-[72px] aspect-square rounded-[20px] transition-all active:scale-[0.98] border border-black/[0.03] ${theme.button}`}
                    title={b.label}
                  >
                    <b.icon className="h-5 w-5 mb-1" />
                    <span className="text-[7px] font-semibold uppercase tracking-[0.05em] truncate w-full px-1 text-center opacity-80">{b.label}</span>
                  </a>
                ))}
              </div>
            )}
            {renderSecondaryActions()}
            {renderMedia()}
            {renderVideos()}
            {renderProducts()}
            {renderContactCard()}
            {profile.description && (
              <div className="mt-6 text-center px-4">
                <p className={`text-sm leading-relaxed ${theme.muted}`}>{profile.description}</p>
              </div>
            )}
            {renderFooter()}
            {renderLeadButton()}
          </div>
        </div>
      </>
    );
  }

  // --- BOLD LAYOUT ---
  return (
    <>
      {customCSS && <style>{customCSS}</style>}
      <title>{profile.brand_name} | Portid</title>
      <meta name="description" content={profile.tagline || profile.description || `${profile.brand_name} profile`} />
      {renderTopCornerWatermark()}
      <div
        className={`min-h-screen ${customColors ? 'profile-ct' : `${theme.bg} ${theme.text}`}`}
        style={customStyle}
      >
        <div className="relative">
          {profile.cover_image_url && (
            <div className="h-64 w-full overflow-hidden">
              <img src={profile.cover_image_url} alt="" className="h-full w-full object-cover" fetchPriority="high" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          )}
          <div className={`${profile.cover_image_url ? 'absolute bottom-0 left-0 right-0' : 'pt-12'} px-5 pb-6`}>
            <div className="flex items-end gap-4">
              {profile.logo_url && (
                <div className="h-[88px] w-[88px] shrink-0 rounded-2xl p-[5px] shadow-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <img src={profile.logo_url} alt={profile.brand_name} className="h-full w-full rounded-xl object-cover" fetchPriority="high" loading="eager" />
                </div>
              )}
              <div>
                <h1 className="font-heading text-3xl font-semibold leading-tight text-white drop-shadow-md">{profile.brand_name}</h1>
                {profile.tagline && <p className="text-sm text-white/80">{profile.tagline}</p>}
                {profile.category && <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs text-white">{profile.category}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-md px-5 pb-10">
          {renderPrimaryAction()}
          {actionButtons.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-3 px-1 max-w-[340px] mx-auto">
              {actionButtons.map(b => (
                <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(b.label)}
                  className={`flex flex-col items-center justify-center w-[72px] aspect-square rounded-[20px] transition-all active:scale-[0.98] shadow-sm border border-black/[0.03] ${theme.button}`}
                  title={b.label}
                >
                  <b.icon className="h-5 w-5 mb-1" />
                  <span className="text-[7px] font-semibold uppercase tracking-[0.05em] truncate w-full px-1 text-center opacity-80">{b.label}</span>
                </a>
              ))}
            </div>
          )}
          {renderSecondaryActions()}
          {renderMedia()}
          {renderVideos()}
          {renderProducts()}
          {renderContactCard()}
          {profile.description && (
            <div className="mt-8 text-center px-4">
              <p className={`text-sm leading-relaxed ${theme.muted}`}>{profile.description}</p>
            </div>
          )}
          {renderFooter()}
          {renderLeadButton()}
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
