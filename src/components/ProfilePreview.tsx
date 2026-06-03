import React from 'react';
import { Phone, MessageCircle, Globe, MapPin, Star, Facebook, Instagram, UserPlus, Share2, Linkedin, Twitter, Youtube, Music2, Mail, Link as LinkIcon, ShoppingBag, Briefcase, Camera, Video, MessageSquare, FileText, Github } from 'lucide-react';
import { getThemeClasses, encodeCustomTheme, parseCustomTheme } from '@/lib/themes';

interface FormData {
  brand_name: string;
  tagline: string;
  description: string;
  logo_preview?: string;
  logo_url?: string;
  cover_preview?: string;
  cover_image_url?: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  website: string;
  email?: string;
  google_review: string;
  location: string;
  address: string;
  media_previews?: string[];
  video_url?: string;
  theme: string;
  layout?: string;
  // custom theme colors
  custom_bg?: string;
  custom_text?: string;
  custom_muted?: string;
  custom_card_bg?: string;
  custom_btn_bg?: string;
  custom_btn_text?: string;
  lead_form_enabled?: boolean;
  lead_form_title?: string;
  hide_watermark?: boolean;
  custom_links?: { id: string; name: string; url: string; }[];
  products?: { id: string; title: string; description: string; image_url?: string; preview?: string }[];
}

const ProfilePreview = ({ form }: { form: FormData }) => {
  if (!form) return null;
  // Build the encoded theme string if custom colors are present
  const themeKey = form.theme === 'custom' && form.custom_bg
    ? encodeCustomTheme({
        bg: form.custom_bg!, text: form.custom_text!, muted: form.custom_muted!,
        cardBg: form.custom_card_bg!, btnBg: form.custom_btn_bg!, btnText: form.custom_btn_text!,
      })
    : form.theme;

  const theme = getThemeClasses(themeKey);
  const customColors = parseCustomTheme(themeKey);
  const customStyle = customColors ? { backgroundColor: customColors.bg, color: customColors.text } : undefined;
  const customCSS = customColors ? `
    .preview-ct .theme-muted { color: ${customColors.muted} !important; }
    .preview-ct .theme-card  { background-color: ${customColors.cardBg} !important; }
    .preview-ct .theme-btn   { background-color: ${customColors.btnBg} !important; color: ${customColors.btnText} !important; }
  ` : '';

  const logo = form.logo_preview || form.logo_url;
  const cover = form.cover_preview || form.cover_image_url;
  const layout = form.layout || 'classic';

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

  const customButtons = (form.custom_links || []).map(link => ({
    label: link.name || 'Link',
    icon: getIconForName(link.name),
    link: link.url,
    href: (link.url || '').startsWith('http') ? link.url : `https://${link.url || ''}`
  }));

  const buttons = [
    { label: 'Call', icon: Phone, link: form.phone, href: `tel:${form.phone}` },
    { label: 'WhatsApp', icon: MessageCircle, link: form.whatsapp, href: `https://wa.me/${form.whatsapp?.replace(/[^0-9]/g, '')}` },
    { label: 'Review', icon: Star, link: form.google_review, href: form.google_review },
    { label: 'Website', icon: Globe, link: form.website, href: form.website },
    { label: 'Email', icon: Mail, link: form.email, href: form.email ? `mailto:${form.email}` : '' },
    { label: 'Instagram', icon: Instagram, link: form.instagram, href: form.instagram },
    { label: 'Facebook', icon: Facebook, link: form.facebook, href: form.facebook },
    { label: 'LinkedIn', icon: Linkedin, link: form.linkedin, href: form.linkedin },
    { label: 'X', icon: Twitter, link: form.twitter, href: form.twitter },
    { label: 'YouTube', icon: Youtube, link: form.youtube, href: form.youtube },
    { label: 'TikTok', icon: Music2, link: form.tiktok, href: form.tiktok },
    { label: 'Location', icon: MapPin, link: form.location, href: form.location?.startsWith('http') ? form.location : `https://maps.google.com/?q=${encodeURIComponent(form.location || '')}` },
    ...customButtons
  ].filter(b => b.link);

  if (layout === 'elegant') return <ElegantLayout form={form} theme={theme} logo={logo} cover={cover} buttons={buttons} customStyle={customStyle} customCSS={customCSS} />;
  if (layout === 'bold') return <BoldLayout form={form} theme={theme} logo={logo} cover={cover} buttons={buttons} customStyle={customStyle} customCSS={customCSS} />;
  return <ClassicLayout form={form} theme={theme} logo={logo} cover={cover} buttons={buttons} customStyle={customStyle} customCSS={customCSS} />;
};

interface LayoutProps {
  form: FormData;
  theme: ReturnType<typeof getThemeClasses>;
  logo: string | undefined;
  cover: string | undefined;
  buttons: { label: string; icon: React.ElementType; link: string; href: string }[];
  customStyle?: React.CSSProperties;
  customCSS?: string;
}

const MediaGrid = ({ previews, theme }: { previews?: string[]; theme: ReturnType<typeof getThemeClasses> }) => {
  if (!previews || previews.length === 0) return null;
  return (
    <div className="mt-6">
      <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
        {previews.map((url, i) => (
          <img key={i} src={url} alt="" className="aspect-square w-full object-cover" />
        ))}
      </div>
    </div>
  );
};

const ContactCard = ({ address, phone, website, email, theme }: { address?: string, phone?: string, website?: string, email?: string, theme: ReturnType<typeof getThemeClasses> }) => {
  const hasInfo = address || phone || website || email;
  if (!hasInfo) return null;

  return (
    <div className={`mt-6 overflow-hidden rounded-2xl border ${theme.cardBg} p-5 shadow-lg shadow-black/5 text-left`}>
      <div className="space-y-4">
        {phone && (
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
              <Phone className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Contact</p>
              <p className="mt-0.5 text-xs font-semibold">{phone}</p>
            </div>
          </div>
        )}
        {website && (
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Website</p>
              <p className="mt-0.5 text-xs font-semibold truncate max-w-[140px]">{website.replace(/^https?:\/\//, '')}</p>
            </div>
          </div>
        )}
        {email && (
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
              <Mail className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Email</p>
              <p className="mt-0.5 text-xs font-semibold truncate max-w-[140px]">{email}</p>
            </div>
          </div>
        )}
        {address && (
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.button} shadow-sm shadow-black/5`}>
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.muted} opacity-70`}>Address</p>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed line-clamp-2">{address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const renderSecondaryActionsPreview = (theme: ReturnType<typeof getThemeClasses>) => (
  <div className="mt-6 flex gap-3 px-1">
    <div className={`flex-1 flex items-center justify-center gap-2 h-8 rounded-xl text-[9px] font-medium border border-black/5 dark:border-white/5 ${theme.cardBg} ${theme.text} opacity-80 shadow-sm`}>
      <UserPlus className="h-3 w-3" />
      Save Contact
    </div>
    <div className={`flex-1 flex items-center justify-center gap-2 h-8 rounded-xl text-[9px] font-medium border border-black/5 dark:border-white/5 ${theme.cardBg} ${theme.text} opacity-80 shadow-sm`}>
      <Share2 className="h-3 w-3" />
      Share
    </div>
  </div>
);

const renderLeadButtonPreview = (title: string, theme: ReturnType<typeof getThemeClasses>) => (
  <div className={`mt-6 w-full flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold shadow-sm ${theme.button}`}>
    <MessageCircle className="h-3.5 w-3.5" />
    {title || 'Enquiry'}
  </div>
);

const ProductsGridPreview = ({ products, theme }: { products?: FormData['products']; theme: ReturnType<typeof getThemeClasses> }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className={`mb-3 text-center font-heading text-xs font-bold ${theme.text}`}>Products & Services</h3>
      <div className="grid grid-cols-2 gap-3">
        {products.map((item) => (
          <div key={item.id} className={`overflow-hidden rounded-xl border ${theme.cardBg} shadow-md shadow-black/10`}>
            <div className="aspect-square w-full">
              <img src={item.preview || item.image_url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-2 text-left">
              <p className="text-[10px] font-bold truncate">{item.title || 'Product'}</p>
              <p className={`text-[8px] line-clamp-1 ${theme.muted} opacity-70`}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClassicLayout = ({ form, theme, logo, cover, buttons, customStyle, customCSS }: LayoutProps) => (
  <>
    {customCSS && <style>{customCSS}</style>}
    <div
      className={`min-h-[500px] ${customStyle ? 'preview-ct' : `${theme.bg} ${theme.text}`}`}
      style={customStyle}
    >
    {cover && (
      <div className="h-36 w-full overflow-hidden">
        <img src={cover} alt="" className="h-full w-full object-cover" />
      </div>
    )}
    <div className="px-5 pb-6">
      <div className={`text-center ${cover ? '-mt-10' : 'pt-8'}`}>
        {logo && <img src={logo} alt="" className="mx-auto h-20 w-20 rounded-full border-4 border-background object-cover shadow-md" />}
        <h1 className="mt-3 font-heading text-xl font-bold">{form.brand_name || 'Brand Name'}</h1>
        {form.tagline && <p className={`mt-1 text-sm ${theme.muted}`}>{form.tagline}</p>}
      </div>
      {buttons.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2.5 px-1 max-w-[270px] mx-auto">
          {buttons.map(b => (
            <div key={b.label}
              className={`flex flex-col items-center justify-center w-[58px] aspect-square rounded-[18px] transition-all shadow-md shadow-black/5 border border-black/[0.03] ${theme.button}`}
              title={b.label}
            >
              <b.icon className="h-4.5 w-4.5 mb-1" />
              <span className="text-[7px] font-black uppercase tracking-[0.05em] truncate w-full px-1 text-center">{b.label}</span>
            </div>
          ))}
        </div>
      )}
      {renderSecondaryActionsPreview(theme)}
      <MediaGrid previews={form.media_previews} theme={theme} />
      <ProductsGridPreview products={form.products} theme={theme} />
      <ContactCard address={form.address} phone={form.phone} website={form.website} email={form.email} theme={theme} />
      {form.description && (
        <div className="mt-6 text-center">
          <p className={`text-sm leading-relaxed ${theme.muted}`}>{form.description}</p>
        </div>
      )}
    </div>
  </div>
  </>
);

const ElegantLayout = ({ form, theme, logo, cover, buttons, customStyle, customCSS }: LayoutProps) => (
  <>
    {customCSS && <style>{customCSS}</style>}
    <div
      className={`min-h-[500px] ${customStyle ? 'preview-ct' : `${theme.bg} ${theme.text}`}`}
      style={customStyle}
    >
      {cover && (
      <div className="h-44 w-full overflow-hidden">
        <img src={cover} alt="" className="h-full w-full object-cover" />
      </div>
    )}
    <div className="px-5 pb-6">
      <div className={`rounded-2xl ${theme.cardBg} px-4 pb-4 text-center shadow-lg relative ${cover ? 'mt-2' : 'mt-10'} border border-black/5`}>
        {logo && (
          <div className={`mx-auto h-20 w-20 rounded-xl p-1 shadow-sm ${theme.cardBg} ${cover ? 'absolute -top-10 left-1/2 -translate-x-1/2' : '-mt-10'}`}>
            <img src={logo} alt="" className="h-full w-full rounded-lg object-cover shadow-md" />
          </div>
        )}
        <div className={logo ? 'pt-12' : 'pt-4'}>
          <h1 className="font-heading text-lg font-bold">{form.brand_name || 'Brand Name'}</h1>
          {form.tagline && <p className={`mt-0.5 text-xs ${theme.muted}`}>{form.tagline}</p>}
        </div>
      </div>
      {buttons.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2.5 px-1 max-w-[270px] mx-auto">
          {buttons.map(b => (
            <div key={b.label}
              className={`flex flex-col items-center justify-center w-[58px] aspect-square rounded-[18px] transition-all shadow-md shadow-black/5 border border-black/[0.03] ${theme.button}`}
              title={b.label}
            >
              <b.icon className="h-4.5 w-4.5 mb-1" />
              <span className="text-[7px] font-black uppercase tracking-[0.05em] truncate w-full px-1 text-center">{b.label}</span>
            </div>
          ))}
        </div>
      )}
      {renderSecondaryActionsPreview(theme)}
      <MediaGrid previews={form.media_previews} theme={theme} />
      <ProductsGridPreview products={form.products} theme={theme} />
      <ContactCard address={form.address} phone={form.phone} website={form.website} email={form.email} theme={theme} />
      {form.description && (
        <div className="mt-5 text-center">
          <p className={`text-sm leading-relaxed ${theme.muted}`}>{form.description}</p>
        </div>
      )}
    </div>
  </div>
  </>
);

const BoldLayout = ({ form, theme, logo, cover, buttons, customStyle, customCSS }: LayoutProps) => (
  <>
    {customCSS && <style>{customCSS}</style>}
    <div
      className={`min-h-[500px] ${customStyle ? 'preview-ct' : `${theme.bg} ${theme.text}`}`}
      style={customStyle}
    >
      <div className="relative">
      {cover && (
        <div className="h-52 w-full overflow-hidden">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      )}
      <div className={`${cover ? 'absolute bottom-0 left-0 right-0' : 'pt-10'} px-5 pb-5`}>
        <div className="flex items-end gap-4">
          {logo && <img src={logo} alt="" className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover shadow-lg" />}
          <div>
            <h1 className="font-heading text-2xl font-black leading-tight text-white drop-shadow-md">{form.brand_name || 'Brand Name'}</h1>
            {form.tagline && <p className="text-sm text-white/80">{form.tagline}</p>}
          </div>
        </div>
      </div>
    </div>
    <div className="px-5 pb-6">
      {buttons.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2.5 px-1 max-w-[270px] mx-auto">
          {buttons.map(b => (
            <div key={b.label}
              className={`flex flex-col items-center justify-center w-[58px] aspect-square rounded-[18px] transition-all shadow-md shadow-black/5 border border-black/[0.03] ${theme.button}`}
              title={b.label}
            >
              <b.icon className="h-4.5 w-4.5 mb-1" />
              <span className="text-[7px] font-black uppercase tracking-[0.05em] truncate w-full px-1 text-center">{b.label}</span>
            </div>
          ))}
        </div>
      )}
      {renderSecondaryActionsPreview(theme)}
      <MediaGrid previews={form.media_previews} theme={theme} />
      <ProductsGridPreview products={form.products} theme={theme} />
      <ContactCard address={form.address} phone={form.phone} website={form.website} email={form.email} theme={theme} />
      {form.description && (
        <div className="mt-5 text-center">
          <p className={`text-sm leading-relaxed ${theme.muted}`}>{form.description}</p>
        </div>
      )}
    </div>
  </div>
  </>
);

export default ProfilePreview;
