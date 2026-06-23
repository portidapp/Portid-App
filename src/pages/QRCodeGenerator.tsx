import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Globe, MessageSquare, Instagram, Star, MapPin, Utensils,
  CreditCard, User, Wifi, Mail, Phone, FileText, Sparkles, Download,
  Copy, Plus, ChevronDown, Check, Upload, Trash2, ArrowLeft, Eye, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import QRCodeStyling from 'qr-code-styling';

interface UserProfile {
  id: string;
  brand_name: string;
  slug: string;
}

const themeColors = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Dark', value: '#18181b' },
];

const getDotsTypeIcon = (type: string) => {
  switch (type) {
    case 'square':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <rect x="3" y="3" width="5" height="5" rx="0.5" />
          <rect x="10" y="3" width="5" height="5" rx="0.5" />
          <rect x="17" y="3" width="5" height="5" rx="0.5" />
          <rect x="3" y="10" width="5" height="5" rx="0.5" />
          <rect x="10" y="10" width="5" height="5" rx="0.5" />
          <rect x="17" y="10" width="5" height="5" rx="0.5" />
          <rect x="3" y="17" width="5" height="5" rx="0.5" />
          <rect x="10" y="17" width="5" height="5" rx="0.5" />
          <rect x="17" y="17" width="5" height="5" rx="0.5" />
        </svg>
      );
    case 'rounded':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <rect x="3" y="3" width="5" height="5" rx="1.8" />
          <rect x="10" y="3" width="5" height="5" rx="1.8" />
          <rect x="17" y="3" width="5" height="5" rx="1.8" />
          <rect x="3" y="10" width="5" height="5" rx="1.8" />
          <rect x="10" y="10" width="5" height="5" rx="1.8" />
          <rect x="17" y="10" width="5" height="5" rx="1.8" />
          <rect x="3" y="17" width="5" height="5" rx="1.8" />
          <rect x="10" y="17" width="5" height="5" rx="1.8" />
          <rect x="17" y="17" width="5" height="5" rx="1.8" />
        </svg>
      );
    case 'dots':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <circle cx="5.5" cy="5.5" r="2.5" />
          <circle cx="12.5" cy="5.5" r="2.5" />
          <circle cx="19.5" cy="5.5" r="2.5" />
          <circle cx="5.5" cy="12.5" r="2.5" />
          <circle cx="12.5" cy="12.5" r="2.5" />
          <circle cx="19.5" cy="12.5" r="2.5" />
          <circle cx="5.5" cy="19.5" r="2.5" />
          <circle cx="12.5" cy="19.5" r="2.5" />
          <circle cx="19.5" cy="19.5" r="2.5" />
        </svg>
      );
    case 'classy':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M 5.5,3 L 8,5.5 L 5.5,8 L 3,5.5 Z" />
          <path d="M 12.5,3 L 15,5.5 L 12.5,8 L 10,5.5 Z" />
          <path d="M 19.5,3 L 22,5.5 L 19.5,8 L 17,5.5 Z" />
          <path d="M 5.5,10 L 8,12.5 L 5.5,15 L 3,12.5 Z" />
          <path d="M 12.5,10 L 15,12.5 L 12.5,15 L 10,12.5 Z" />
          <path d="M 19.5,10 L 22,12.5 L 19.5,15 L 17,12.5 Z" />
          <path d="M 5.5,17 L 8,19.5 L 5.5,22 L 3,19.5 Z" />
          <path d="M 12.5,17 L 15,19.5 L 12.5,22 L 10,19.5 Z" />
          <path d="M 19.5,17 L 22,19.5 L 19.5,22 L 17,19.5 Z" />
        </svg>
      );
    case 'classy-rounded':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <rect x="3.5" y="3.5" width="4" height="4" rx="1.5" transform="rotate(45 5.5 5.5)" />
          <rect x="10.5" y="3.5" width="4" height="4" rx="1.5" transform="rotate(45 12.5 5.5)" />
          <rect x="17.5" y="3.5" width="4" height="4" rx="1.5" transform="rotate(45 19.5 5.5)" />
          <rect x="3.5" y="10.5" width="4" height="4" rx="1.5" transform="rotate(45 5.5 12.5)" />
          <rect x="10.5" y="10.5" width="4" height="4" rx="1.5" transform="rotate(45 12.5 12.5)" />
          <rect x="17.5" y="10.5" width="4" height="4" rx="1.5" transform="rotate(45 19.5 12.5)" />
          <rect x="3.5" y="17.5" width="4" height="4" rx="1.5" transform="rotate(45 5.5 19.5)" />
          <rect x="10.5" y="17.5" width="4" height="4" rx="1.5" transform="rotate(45 12.5 19.5)" />
          <rect x="17.5" y="17.5" width="4" height="4" rx="1.5" transform="rotate(45 19.5 19.5)" />
        </svg>
      );
    case 'extra-rounded':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <circle cx="5.5" cy="5.5" r="2.7" />
          <circle cx="12.5" cy="5.5" r="2.7" />
          <circle cx="19.5" cy="5.5" r="2.7" />
          <circle cx="5.5" cy="12.5" r="2.7" />
          <circle cx="12.5" cy="12.5" r="2.7" />
          <circle cx="19.5" cy="12.5" r="2.7" />
          <circle cx="5.5" cy="19.5" r="2.7" />
          <circle cx="12.5" cy="19.5" r="2.7" />
          <circle cx="19.5" cy="19.5" r="2.7" />
        </svg>
      );
    default:
      return null;
  }
};

const getCornersSquareIcon = (type: string) => {
  switch (type) {
    case 'square':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="4.5" y="4.5" width="15" height="15" rx="0" />
        </svg>
      );
    case 'dot':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="7.5" />
        </svg>
      );
    case 'extra-rounded':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
        </svg>
      );
    case 'outward-rounded':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M 4.5,11.5 A 7,7 0 0,1 11.5,4.5 L 15,4.5 A 4.5,4.5 0 0,1 19.5,9 L 19.5,15 A 4.5,4.5 0 0,1 15,19.5 L 9,19.5 A 4.5,4.5 0 0,1 4.5,15 Z" />
        </svg>
      );
    case 'inward-rounded':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M 4.5,4.5 L 19.5,4.5 L 19.5,19.5 L 11.5,19.5 A 7,7 0 0,1 4.5,12.5 Z" />
        </svg>
      );
    default:
      return null;
  }
};

const getCornersDotIcon = (type: string) => {
  switch (type) {
    case 'square':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <rect x="7" y="7" width="10" height="10" rx="0" />
        </svg>
      );
    case 'dot':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
    default:
      return null;
  }
};

const QRCodeGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Tab types
  const [activeTab, setActiveTab] = useState<'website' | 'whatsapp' | 'instagram' | 'review' | 'location' | 'menu' | 'payment' | 'vcard' | 'wifi' | 'email' | 'phone' | 'text'>('website');

  // Input states
  const [websiteUrl, setWebsiteUrl] = useState('https://portid.in');
  const [waPhone, setWaPhone] = useState('');
  const [waText, setWaText] = useState('');
  const [instaUser, setInstaUser] = useState('');
  const [reviewUrl, setReviewUrl] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');
  const [menuUrl, setMenuUrl] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  
  // vCard states
  const [vFirst, setVFirst] = useState('');
  const [vLast, setVLast] = useState('');
  const [vOrg, setVOrg] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vWebsite, setVWebsite] = useState('');
  
  // WiFi states
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Email states
  const [emailTo, setEmailTo] = useState('');
  const [emailSub, setEmailSub] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone states
  const [phoneNum, setPhoneNum] = useState('');

  // Plain Text states
  const [plainText, setPlainText] = useState('');

  // Design/Styling customizers
  const [qrColor, setQrColor] = useState('#f97316');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrTransparent, setQrTransparent] = useState(false);
  const [qrDotsType, setQrDotsType] = useState('rounded');
  const [qrCornersSquareType, setQrCornersSquareType] = useState('extra-rounded');
  const [qrCornersDotType, setQrCornersDotType] = useState('dot');
  
  // Logo & Branding
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  
  // Frames
  const [frameText, setFrameText] = useState('');
  const [frameColor, setFrameColor] = useState('#f97316');

  // Auth User claim flow
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [savingLoading, setSavingLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isDynamic, setIsDynamic] = useState(false);

  // Compute final QR String payload
  const [qrValue, setQrValue] = useState('https://portid.in');

  useEffect(() => {
    let payload = 'https://portid.in';
    switch (activeTab) {
      case 'website':
        payload = websiteUrl || 'https://portid.in';
        break;
      case 'whatsapp':
        payload = `https://wa.me/${waPhone || '910000000000'}?text=${encodeURIComponent(waText || '')}`;
        break;
      case 'instagram':
        payload = instaUser ? `https://instagram.com/${instaUser.replace('@', '')}` : 'https://instagram.com';
        break;
      case 'review':
        payload = reviewUrl || 'https://search.google.com';
        break;
      case 'location':
        payload = `https://maps.google.com/local?q=${lat || '0'},${lng || '0'}`;
        break;
      case 'menu':
        payload = menuUrl || 'https://portid.in';
        break;
      case 'payment':
        payload = paymentUrl || 'upi://pay';
        break;
      case 'vcard':
        payload = `BEGIN:VCARD\nVERSION:3.0\nN:${vLast};${vFirst};;;\nFN:${vFirst} ${vLast}\nORG:${vOrg}\nTITLE:${vTitle}\nTEL;TYPE=CELL:${vPhone}\nEMAIL:${vEmail}\nURL:${vWebsite}\nEND:VCARD`;
        break;
      case 'wifi':
        payload = `WIFI:S:${wifiSsid || 'Network'};T:${wifiType};P:${wifiPass || ''};;`;
        break;
      case 'email':
        payload = `mailto:${emailTo || 'hello@portid.in'}?subject=${encodeURIComponent(emailSub || '')}&body=${encodeURIComponent(emailBody || '')}`;
        break;
      case 'phone':
        payload = `tel:${phoneNum || ''}`;
        break;
      case 'text':
        payload = plainText || 'Portid custom QR';
        break;
    }
    setQrValue(payload);
  }, [
    activeTab, websiteUrl, waPhone, waText, instaUser, reviewUrl, lat, lng,
    menuUrl, paymentUrl, vFirst, vLast, vOrg, vTitle, vPhone, vEmail, vWebsite,
    wifiSsid, wifiPass, wifiType, emailTo, emailSub, emailBody, phoneNum, plainText
  ]);

  // Fetch logged in user profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, brand_name, slug')
          .eq('user_id', user.id);
        if (error) throw error;
        setUserProfiles(data || []);
        if (data && data.length > 0) {
          setSelectedProfileId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }
    };
    fetchProfiles();
  }, [user]);

  // QR rendering instances
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: 260,
      height: 260,
      type: 'svg',
      data: qrValue,
      margin: 15,
      dotsOptions: {
        color: qrColor,
        type: qrDotsType as any,
      },
      cornersSquareOptions: {
        color: qrColor,
        type: qrCornersSquareType as any,
      },
      cornersDotOptions: {
        color: qrColor,
        type: qrCornersDotType as any,
      },
      backgroundOptions: {
        color: qrTransparent ? 'transparent' : qrBgColor,
      },
      image: logoDataUrl || undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSizeFactor: 0.35
      }
    });

    qrCodeRef.current = qrCode;

    if (previewContainerRef.current) {
      previewContainerRef.current.innerHTML = '';
      qrCode.append(previewContainerRef.current);
    }
  }, [qrValue]);

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        dotsOptions: {
          color: qrColor,
          type: qrDotsType as any,
        },
        cornersSquareOptions: {
          color: qrColor,
          type: qrCornersSquareType as any,
        },
        cornersDotOptions: {
          color: qrColor,
          type: qrCornersDotType as any,
        },
        backgroundOptions: {
          color: qrTransparent ? 'transparent' : qrBgColor,
        },
        image: logoDataUrl || undefined
      });
    }
  }, [qrColor, qrBgColor, qrTransparent, qrDotsType, qrCornersSquareType, qrCornersDotType, logoDataUrl]);

  // File logo upload reader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoDataUrl(reader.result as string);
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Download logic
  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      const downloadName = `portid-qr-${activeTab}`;
      const urlToEncode = isDynamic && user ? `${window.location.origin}/q/DYN_${Math.random().toString(36).substring(2, 8).toUpperCase()}` : qrValue;
      
      const qrCode = new QRCodeStyling({
        width: 1024,
        height: 1024,
        type: format === 'svg' ? 'svg' : 'canvas',
        data: urlToEncode,
        margin: 100,
        dotsOptions: {
          color: qrColor,
          type: qrDotsType as any
        },
        cornersSquareOptions: {
          color: qrColor,
          type: qrCornersSquareType as any
        },
        cornersDotOptions: {
          color: qrColor,
          type: qrCornersDotType as any
        },
        backgroundOptions: {
          color: qrTransparent ? 'transparent' : qrBgColor
        },
        image: logoDataUrl || undefined,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 15,
          imageSizeFactor: 0.35
        }
      });

      // If frameText is set, construct frame canvas download
      if (frameText && format === 'png') {
        const rawCanvas = await qrCode.getRawData('png');
        if (!rawCanvas) return;
        const blobUrl = URL.createObjectURL(rawCanvas);
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const canvasWidth = 1024;
          const canvasHeight = 1220; // Extra room for label
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          // Fill Background
          ctx.fillStyle = qrTransparent ? 'transparent' : qrBgColor;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Draw QR
          ctx.drawImage(img, 0, 0, 1024, 1024);

          // Draw Frame/Label Banner at the bottom
          ctx.fillStyle = frameColor;
          const bannerY = 1000;
          const bannerHeight = 160;
          const radius = 25;

          ctx.beginPath();
          ctx.moveTo(80, bannerY);
          ctx.lineTo(944, bannerY);
          ctx.quadraticCurveTo(944 + radius, bannerY, 944 + radius, bannerY + radius);
          ctx.lineTo(944 + radius, bannerY + bannerHeight - radius);
          ctx.quadraticCurveTo(944 + radius, bannerY + bannerHeight, 944, bannerY + bannerHeight);
          ctx.lineTo(80 + radius, bannerY + bannerHeight);
          ctx.quadraticCurveTo(80, bannerY + bannerHeight, 80, bannerY + bannerHeight - radius);
          ctx.lineTo(80, bannerY + radius);
          ctx.quadraticCurveTo(80, bannerY, 80 + radius, bannerY);
          ctx.closePath();
          ctx.fill();

          // Render Frame Text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'black 50px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, bannerY + bannerHeight / 2);

          // Download combined canvas
          const link = document.createElement('a');
          link.download = `${downloadName}-frame.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.success("Downloaded custom framed QR Code PNG!");
        };
        img.src = blobUrl;
      } else {
        await qrCode.download({
          name: downloadName,
          extension: format
        });
        toast.success(`Successfully downloaded ${format.toUpperCase()}!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate download.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    toast.success("QR Code content copied to clipboard!");
  };

  const handleSaveDynamicQR = async () => {
    if (!user) {
      setShowUpgradeModal(true);
      return;
    }

    setSavingLoading(true);
    const newCode = `DYN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const dynamicStyle = {
      color: qrColor,
      dotsType: qrDotsType,
      cornersSquareType: qrCornersSquareType,
      cornersDotType: qrCornersDotType,
      fileFormat: 'png',
      transparent: qrTransparent
    };

    try {
      const payload: any = {
        code: newCode,
        name: `Dynamic QR (${activeTab})`,
        user_id: user.id,
        status: 'assigned',
        style: dynamicStyle
      };

      if (selectedProfileId) {
        payload.assigned_profile_id = selectedProfileId;
      } else {
        payload.custom_url = qrValue;
      }

      const { error } = await supabase
        .from('qr_codes')
        .insert(payload);

      if (error) throw error;

      toast.success(`Successfully saved Dynamic QR code ${newCode} to your account!`);
      setIsDynamic(true);
    } catch (err: any) {
      console.error("Save dynamic error:", err);
      toast.error(err.message || "Failed to save dynamic QR code.");
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans pb-20">
      {/* Navigation Header */}
      <header className="h-20 bg-white border-b border-zinc-200/80 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-orange-500" />
          <span className="font-heading text-lg font-black tracking-tight text-zinc-900">
            Portid <span className="text-orange-500 font-bold">Codes</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900">
            <Link to={user ? "/dashboard" : "/login"}>
              {user ? "Dashboard" : "Log In"}
            </Link>
          </Button>
          {!user && (
            <Button asChild className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20">
              <Link to="/signup">Get Started</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Hero section */}
      <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto px-4">
        <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
          Free Custom generator
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
          Create Custom QR Codes in Seconds
        </h1>
        <p className="text-sm sm:text-base font-semibold text-zinc-500 mt-4 leading-relaxed max-w-xl mx-auto">
          Paste your link, customize your QR, and download instantly. No login required.
        </p>
      </div>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Customizer Panel */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* 12 QR Type selectors */}
          <Card className="bg-white border-zinc-200/80 rounded-3xl shadow-sm p-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 ml-1">1. Choose QR Code Content Type</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {[
                { id: 'website', label: 'Website', icon: Globe },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'instagram', label: 'Instagram', icon: Instagram },
                { id: 'review', label: 'Google Review', icon: Star },
                { id: 'location', label: 'Location', icon: MapPin },
                { id: 'menu', label: 'Menu', icon: Utensils },
                { id: 'payment', label: 'Payment', icon: CreditCard },
                { id: 'vcard', label: 'Contact', icon: User },
                { id: 'wifi', label: 'WiFi', icon: Wifi },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'phone', label: 'Phone', icon: Phone },
                { id: 'text', label: 'Plain Text', icon: FileText },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-350 hover:text-zinc-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1.5" />
                    <span className="text-[10px] font-bold tracking-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Form */}
            <div className="mt-6 pt-6 border-t border-zinc-150">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 ml-1">2. Enter Information</h3>
              <div className="space-y-4 animate-in fade-in duration-300">
                {activeTab === 'website' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Website URL</label>
                    <Input
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                    />
                  </div>
                )}
                
                {activeTab === 'whatsapp' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number (with Country Code)</label>
                      <Input
                        placeholder="e.g. 919876543210"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Prefilled Message</label>
                      <Input
                        placeholder="Hello, I would like to enquire..."
                        value={waText}
                        onChange={(e) => setWaText(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'instagram' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Instagram Username</label>
                    <Input
                      placeholder="e.g. portid.in"
                      value={instaUser}
                      onChange={(e) => setInstaUser(e.target.value)}
                      className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                    />
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Google Review URL</label>
                    <Input
                      placeholder="https://g.page/r/your-review-link"
                      value={reviewUrl}
                      onChange={(e) => setReviewUrl(e.target.value)}
                      className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                    />
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Latitude</label>
                      <Input
                        placeholder="e.g. 12.9716"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Longitude</label>
                      <Input
                        placeholder="e.g. 77.5946"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'menu' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Menu PDF / Link URL</label>
                    <Input
                      placeholder="https://myrestaurant.com/menu.pdf"
                      value={menuUrl}
                      onChange={(e) => setMenuUrl(e.target.value)}
                      className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                    />
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">UPI ID or Payment gateway link</label>
                    <Input
                      placeholder="e.g. merchant@ybl or https://razorpay.me/xyz"
                      value={paymentUrl}
                      onChange={(e) => setPaymentUrl(e.target.value)}
                      className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                    />
                  </div>
                )}

                {activeTab === 'vcard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">First Name</label>
                      <Input
                        placeholder="John"
                        value={vFirst}
                        onChange={(e) => setVFirst(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Last Name</label>
                      <Input
                        placeholder="Doe"
                        value={vLast}
                        onChange={(e) => setVLast(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Company / Organization</label>
                      <Input
                        placeholder="Acme Corp"
                        value={vOrg}
                        onChange={(e) => setVOrg(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Job Title</label>
                      <Input
                        placeholder="Marketing Specialist"
                        value={vTitle}
                        onChange={(e) => setVTitle(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Mobile Phone</label>
                      <Input
                        placeholder="+1234567890"
                        value={vPhone}
                        onChange={(e) => setVPhone(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email ID</label>
                      <Input
                        placeholder="john.doe@example.com"
                        value={vEmail}
                        onChange={(e) => setVEmail(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left sm:col-span-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Website URL</label>
                      <Input
                        placeholder="https://example.com"
                        value={vWebsite}
                        onChange={(e) => setVWebsite(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'wifi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">SSID (Network Name)</label>
                      <Input
                        placeholder="My Home WiFi"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Security Type</label>
                      <select
                        value={wifiType}
                        onChange={(e) => setWifiType(e.target.value as any)}
                        className="w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 text-xs font-bold focus:border-orange-500 focus:outline-none"
                      >
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None (Open)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Recipient Email</label>
                        <Input
                          placeholder="recipient@example.com"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</label>
                        <Input
                          placeholder="Subject"
                          value={emailSub}
                          onChange={(e) => setEmailSub(e.target.value)}
                          className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Body Message</label>
                      <textarea
                        rows={3}
                        placeholder="Write your email body message here..."
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full p-3 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'phone' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <Input
                      placeholder="e.g. +919876543210"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50"
                    />
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Plain Text</label>
                    <textarea
                      rows={4}
                      placeholder="Type your plain text message here..."
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      className="w-full p-3 rounded-xl border border-zinc-200 focus:border-orange-500 focus:ring-1 bg-zinc-50 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Style Customization Accordion */}
          <Card className="bg-white border-zinc-200/80 rounded-3xl shadow-sm p-6 text-left space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">3. Custom Styling & Branding</h2>
            
            {/* Color Configurator */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Customize Colors</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60">
                {/* Foreground QR Color */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 ml-0.5 block">QR Code Color</label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {themeColors.map(tc => {
                      const isSelected = qrColor === tc.value;
                      return (
                        <button
                          key={tc.value}
                          type="button"
                          onClick={() => setQrColor(tc.value)}
                          style={{ backgroundColor: tc.value }}
                          className={`w-7 h-7 rounded-full relative border border-black/10 hover:scale-105 transition-all flex items-center justify-center`}
                          title={tc.name}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                    {/* Custom Color picker */}
                    <div className="w-7 h-7 rounded-full border border-zinc-300 bg-gradient-to-tr from-rose-450 via-emerald-450 to-blue-450 relative flex items-center justify-center cursor-pointer hover:scale-105 overflow-hidden">
                      <input
                        type="color"
                        value={qrColor}
                        onChange={e => setQrColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {!themeColors.some(tc => tc.value.toLowerCase() === qrColor.toLowerCase()) && (
                        <Check className="h-3.5 w-3.5 text-white stroke-[3] drop-shadow-md z-10" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Background QR Color */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 ml-0.5 block">Background Color</label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {['#ffffff', '#f4f4f5', '#e4e4e7', '#09090b'].map(c => {
                        const isSelected = qrBgColor === c && !qrTransparent;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setQrBgColor(c);
                              setQrTransparent(false);
                            }}
                            style={{ backgroundColor: c }}
                            className={`w-7 h-7 rounded-full relative border border-zinc-200 hover:scale-105 transition-all flex items-center justify-center`}
                          >
                            {isSelected && <Check className={`h-3.5 w-3.5 stroke-[3] ${c === '#09090b' ? 'text-white' : 'text-zinc-800'}`} />}
                          </button>
                        );
                      })}
                      {/* Custom picker */}
                      <div className="w-7 h-7 rounded-full border border-zinc-300 bg-gradient-to-tr from-rose-400 via-emerald-400 to-blue-400 relative flex items-center justify-center cursor-pointer hover:scale-105 overflow-hidden">
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={e => {
                            setQrBgColor(e.target.value);
                            setQrTransparent(false);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {!qrTransparent && !['#ffffff', '#f4f4f5', '#e4e4e7', '#09090b'].some(c => c.toLowerCase() === qrBgColor.toLowerCase()) && (
                          <Check className="h-3.5 w-3.5 text-white stroke-[3] drop-shadow-md z-10" />
                        )}
                      </div>
                    </div>

                    {/* Transparency toggle */}
                    <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-3">
                      <input
                        id="transparent-toggle"
                        type="checkbox"
                        checked={qrTransparent}
                        onChange={e => setQrTransparent(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-zinc-300 text-orange-500 accent-orange-500 cursor-pointer"
                      />
                      <label htmlFor="transparent-toggle" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer">
                        Transparent
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shape Selectors */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Customize Shapes</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60">
                {/* Dots */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-600 block ml-0.5">Dots Pattern</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'dots', label: 'Dots' },
                      { id: 'classy', label: 'Classy' },
                      { id: 'classy-rounded', label: 'Classy Rounded' },
                      { id: 'extra-rounded', label: 'Extra Rounded' },
                    ].map(opt => {
                      const isSelected = qrDotsType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setQrDotsType(opt.id)}
                          title={opt.label}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                              : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-650'
                          }`}
                        >
                          {getDotsTypeIcon(opt.id)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Marker outer */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-600 block ml-0.5">Marker Border</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'dot', label: 'Dot' },
                      { id: 'extra-rounded', label: 'Rounded' },
                      { id: 'outward-rounded', label: 'Outward' },
                      { id: 'inward-rounded', label: 'Inward' },
                    ].map(opt => {
                      const isSelected = qrCornersSquareType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setQrCornersSquareType(opt.id)}
                          title={opt.label}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                              : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-650'
                          }`}
                        >
                          {getCornersSquareIcon(opt.id)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Marker inner */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-600 block ml-0.5">Marker Center</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'dot', label: 'Dot' },
                    ].map(opt => {
                      const isSelected = qrCornersDotType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setQrCornersDotType(opt.id)}
                          title={opt.label}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                              : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-650'
                          }`}
                        >
                          {getCornersDotIcon(opt.id)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Customizer */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Branding & Logo Overlay</span>
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-zinc-200 rounded-xl bg-white flex items-center justify-center text-zinc-400 overflow-hidden relative">
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="Logo" className="object-contain h-full w-full p-1" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-zinc-700">Center Image Logo</p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Supports PNG, JPEG (Square format works best)</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Button type="button" variant="outline" className="w-full h-10 px-4 rounded-xl border-zinc-200 bg-white text-zinc-700 text-xs font-bold uppercase tracking-wider">
                      Upload Logo
                    </Button>
                  </div>
                  {logoDataUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLogoDataUrl('')}
                      className="h-10 w-10 p-0 rounded-xl border-zinc-200 text-rose-500 bg-white hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Frame Customizer */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Add Frame Banner</span>
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-600 block ml-0.5">Frame Banner Text</label>
                    <select
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-xs font-bold focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">No Frame Banner</option>
                      <option value="SCAN ME">SCAN ME</option>
                      <option value="VISIT WEBSITE">VISIT WEBSITE</option>
                      <option value="FOLLOW US">FOLLOW US</option>
                      <option value="MENU">MENU</option>
                      <option value="REVIEW US">REVIEW US</option>
                    </select>
                  </div>

                  {frameText && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[10px] font-bold text-zinc-600 block ml-0.5">Frame Banner Color</label>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 flex-1">
                          {themeColors.slice(0, 5).map(c => {
                            const isSelected = frameColor === c.value;
                            return (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => setFrameColor(c.value)}
                                style={{ backgroundColor: c.value }}
                                className={`w-7 h-7 rounded-full relative border border-black/10 hover:scale-105 transition-all flex items-center justify-center`}
                              >
                                {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                        {/* Custom picker */}
                        <div className="w-7 h-7 rounded-full border border-zinc-300 bg-gradient-to-tr from-rose-400 via-emerald-400 to-blue-400 relative flex items-center justify-center cursor-pointer hover:scale-105 overflow-hidden">
                          <input
                            type="color"
                            value={frameColor}
                            onChange={e => setFrameColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Right Column - Live Preview / Dynamic Claims */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Main Preview Container */}
          <Card className="bg-white border-zinc-200/80 rounded-[2.5rem] shadow-sm p-6 flex flex-col items-center justify-center space-y-5">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center self-start ml-1">
              Live Interactive Preview
            </h3>

            {/* Frame Wrapper Mock */}
            <div
              className={`p-5 rounded-[2.2rem] transition-all flex flex-col items-center ${
                qrTransparent ? 'bg-[#f4f4f5]' : ''
              }`}
              style={qrTransparent ? {
                backgroundImage: 'linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                border: '1px border border-zinc-200'
              } : {
                backgroundColor: qrBgColor,
                border: '1px border border-zinc-150',
                boxShadow: '0 4px 20px -2px rgba(24, 24, 27, 0.05)'
              }}
            >
              {/* QR Render Node */}
              <div ref={previewContainerRef} className="w-[260px] h-[260px] flex items-center justify-center" />

              {/* Simulated HTML frame banner */}
              {frameText && (
                <div
                  style={{ backgroundColor: frameColor }}
                  className="mt-4 w-[230px] h-11 flex items-center justify-center rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-md animate-in slide-in-from-bottom-1 duration-300"
                >
                  {frameText}
                </div>
              )}
            </div>

            {/* Copy & Share utilities */}
            <div className="w-full flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1 h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-bold uppercase tracking-wider"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Link
              </Button>
            </div>

            {/* Download actions */}
            <div className="w-full border-t border-zinc-150 pt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => handleDownload('png')}
                className="h-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-widest"
              >
                <Download className="h-4 w-4 mr-2" /> PNG
              </Button>
              <Button
                type="button"
                onClick={() => handleDownload('svg')}
                className="h-11 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 text-xs font-black uppercase tracking-widest"
              >
                <Download className="h-4 w-4 mr-2" /> SVG
              </Button>
            </div>

            {/* Logged in custom claims / dynamic setup */}
            {user ? (
              <div className="w-full border-t border-zinc-150 pt-4 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Dynamic Redirect settings</span>
                  <div className="flex items-center gap-1">
                    <input
                      id="dynamic-toggle"
                      type="checkbox"
                      checked={isDynamic}
                      onChange={e => setIsDynamic(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-orange-500 accent-orange-500 cursor-pointer"
                    />
                    <label htmlFor="dynamic-toggle" className="text-[10px] font-bold text-orange-500 uppercase tracking-wider cursor-pointer">
                      Dynamic
                    </label>
                  </div>
                </div>

                {isDynamic && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-1">
                        Connect to Portid Profile
                      </label>
                      {userProfiles.length === 0 ? (
                        <p className="text-[10px] text-zinc-400 leading-normal ml-1">
                          You don't have any business profiles. Create one to link this dynamic QR code.
                        </p>
                      ) : (
                        <div className="relative">
                          <select
                            value={selectedProfileId}
                            onChange={e => setSelectedProfileId(e.target.value)}
                            className="w-full h-10 pl-3 pr-10 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-850 text-xs font-semibold focus:border-orange-500 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Redirect to raw URL (Custom)</option>
                            {userProfiles.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.brand_name} (/{p.slug})
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleSaveDynamicQR}
                      disabled={savingLoading}
                      className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                    >
                      {savingLoading ? (
                        <div className="flex items-center gap-1 justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving Dynamic QR...</span>
                        </div>
                      ) : (
                        <span>Save Dynamic QR</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Upgrade CTA card for Guest Users
              <div className="w-full border-t border-zinc-150 pt-4 text-left animate-in fade-in duration-300">
                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Crown className="h-4 w-4 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Want to edit this QR later?</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Convert this to a <strong>Dynamic QR code</strong> to change links anytime without reprinting, track scans, capture leads, and setup physical NFC stands.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  >
                    Upgrade to Dynamic QR
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </aside>
      </main>

      {/* UPGRADE / SIGNUP PROMPT MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-200 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-4">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>

              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Unlock Dynamic QR Codes</h3>
              <p className="text-xs text-zinc-500 font-semibold mt-2 px-2 leading-relaxed">
                Dynamic QR codes allow you to edit the target URL anytime without changing the physical QR graphic. Great for menus, profile edits, and link target updates.
              </p>

              {/* Benefits list */}
              <div className="my-6 text-left bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl space-y-2.5">
                {[
                  "Dynamic QR (Change link destination anytime)",
                  "Scan Analytics (Track scans, locations, devices)",
                  "Lead capture form integrations",
                  "Rich Portid business contact profile card",
                  "NFC physical stand support"
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                    <Check className="h-3.5 w-3.5 text-orange-500 stroke-[3]" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  className="h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                >
                  <Link to="/signup">Create Free Account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider"
                >
                  <Link to="/login">Log In Instead</Link>
                </Button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-[10px] font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest mt-2"
                >
                  Close & Continue Free
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRCodeGenerator;
