import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Globe, MessageSquare, Instagram, Star, MapPin, Utensils,
  CreditCard, User, Wifi, Mail, Phone, FileText, Sparkles, Download,
  Copy, Plus, ChevronDown, Check, Upload, Trash2, ArrowLeft, Eye, Crown,
  Loader2, Camera, ShieldAlert, ExternalLink, Link as LinkIcon, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import QRCodeStyling from 'qr-code-styling';
import { Html5Qrcode } from 'html5-qrcode';

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
  const { user, planTier } = useAuth();

  // Connect Printed QR mode states
  const [mode, setMode] = useState<'create' | 'connect'>('create');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'checking' | 'unassigned' | 'assigned' | 'success' | 'error'>('idle');
  const [scannedCode, setScannedCode] = useState('');
  const [qrData, setQrData] = useState<any>(null);
  const [connectType, setConnectType] = useState<'profile' | 'url'>('profile');
  const [customUrl, setCustomUrl] = useState('');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scannerError, setScannerError] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  // Html5Qrcode instance ref
  const html5QrCodeRef = useRef<any>(null);

  // New inline Dynamic QR states
  const [savedDynamicCode, setSavedDynamicCode] = useState<string>('');
  const [isDynamicSaved, setIsDynamicSaved] = useState<boolean>(false);
  const [dynamicRedirectType, setDynamicRedirectType] = useState<'url' | 'profile'>('url');
  
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
  const [userDynamicQrs, setUserDynamicQrs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from('qr_codes').select('*').eq('user_id', user.id).then(({ data }) => {
        if (data) {
          const dQrs = data.filter((q: any) => q.code.startsWith('DYN_'));
          setUserDynamicQrs(dQrs);
        }
      });
    }
  }, [user]);

  const handleGenerateDynamicQR = async () => {
    if (!user) {
      setShowUpgradeModal(true);
      return;
    }
    if (userDynamicQrs.length >= 1) {
      toast.error('You already have a dynamic QR code. Check your dashboard!');
      return;
    }

    setSavingLoading(true);
    const code = 'DYN_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const styleObj = {
      color: qrColor,
      bgColor: qrBgColor,
      transparent: qrTransparent,
      dotsType: qrDotsType,
      cornersSquareType: qrCornersSquareType,
      cornersDotType: qrCornersDotType,
    };

    try {
      const { error } = await supabase.from('qr_codes').insert({
        user_id: user.id,
        code,
        custom_url: qrValue,
        status: 'assigned',
        style: styleObj,
        name: 'My Dynamic QR'
      });

      if (error) throw error;
      
      toast.success('Dynamic QR generated successfully!');
      setUserDynamicQrs([{ code, custom_url: qrValue, style: styleObj }]);
      setSavedDynamicCode(code);
      setIsDynamicSaved(true);
      setIsDynamic(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to generate dynamic QR');
    } finally {
      setSavingLoading(false);
    }
  };

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

  // Resolve current QR Data (Static or Dynamic saved)
  const currentQrData = isDynamic && isDynamicSaved && savedDynamicCode
    ? `${window.location.origin}/q/${savedDynamicCode}`
    : qrValue;

  // QR rendering instances
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: 260,
      height: 260,
      type: 'svg',
      data: currentQrData,
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
        imageSize: 0.35
      }
    });

    qrCodeRef.current = qrCode;

    if (previewContainerRef.current) {
      previewContainerRef.current.innerHTML = '';
      qrCode.append(previewContainerRef.current);
    }
  }, [currentQrData]);

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
      const urlToEncode = currentQrData;
      
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
          imageSize: 0.35
        }
      });

      // If frameText is set, construct frame canvas download
      if (frameText && format === 'png') {
        const rawCanvas = await qrCode.getRawData('png');
        if (!rawCanvas) return;
        const blobUrl = URL.createObjectURL(rawCanvas as Blob);
        
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
    navigator.clipboard.writeText(currentQrData);
    toast.success("QR Code content copied to clipboard!");
  };

  // Removed unused handleSaveDynamicQR and handleResetDynamic

  // Connect Printed QR feature methods
  const startScanner = async () => {
    setScannerError('');
    setScanState('scanning');
    
    // Allow React to render the div element first
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            // Found QR Code!
            handleQRCodeScanned(decodedText);
          },
          (errorMessage) => {
            // Verbose error, ignore
          }
        );
      } catch (err: any) {
        console.error("Scanner start error:", err);
        setScannerError(err.message || "Failed to access camera. Please make sure permissions are granted.");
        setScanState('error');
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      html5QrCodeRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const extractCode = (text: string): string => {
    if (text.includes('/q/')) {
      const parts = text.split('/q/');
      if (parts.length > 1) {
        const codePart = parts[1].split('?')[0].split('#')[0];
        return codePart.trim();
      }
    }
    return text.trim();
  };

  const handleQRCodeScanned = async (text: string) => {
    await stopScanner();
    const code = extractCode(text);
    setScannedCode(code);
    await checkCodeInDatabase(code);
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    const code = extractCode(manualCodeInput);
    setScannedCode(code);
    await checkCodeInDatabase(code);
  };

  const checkCodeInDatabase = async (code: string) => {
    setScanState('checking');
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*, profiles(slug, brand_name)')
        .eq('code', code)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setScannerError(`QR code "${code}" is not registered in our system.`);
        setScanState('error');
        return;
      }

      setQrData(data);
      if (data.status === 'assigned') {
        setScanState('assigned');
      } else {
        setScanState('unassigned');
        setCustomUrl('');
      }
    } catch (err: any) {
      console.error("Error checking QR code:", err);
      setScannerError(err.message || "Failed to check QR code in the database.");
      setScanState('error');
    }
  };

  const handleConnectQR = async () => {
    if (!user) {
      toast.error("You must be logged in to claim a QR code.");
      return;
    }
    setConnectLoading(true);
    try {
      const isProfile = connectType === 'profile';
      const profileId = isProfile ? selectedProfileId : null;
      let targetUrl = isProfile ? null : customUrl.trim();

      if (!isProfile) {
        if (!targetUrl) {
          toast.error("Please enter a custom URL.");
          setConnectLoading(false);
          return;
        }
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = 'https://' + targetUrl;
        }
        try {
          new URL(targetUrl);
        } catch (_) {
          toast.error("Please enter a valid web URL.");
          setConnectLoading(false);
          return;
        }
      } else {
        if (!profileId) {
          toast.error("Please select a profile to connect.");
          setConnectLoading(false);
          return;
        }
      }

      // Secure claim: check status is available to prevent race conditions
      const { data, error } = await supabase
        .from('qr_codes')
        .update({
          user_id: user.id,
          assigned_profile_id: profileId,
          custom_url: targetUrl,
          status: 'assigned'
        })
        .eq('code', scannedCode)
        .eq('status', 'available')
        .select('*, profiles(slug, brand_name)');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("This QR code is no longer available or was already connected.");
      }

      setQrData(data[0]);
      setScanState('success');
      toast.success("QR Code successfully connected!");
    } catch (err: any) {
      console.error("Error connecting QR code:", err);
      toast.error(err.message || "Failed to connect QR code.");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleUnlinkQR = async () => {
    if (!user || !qrData) return;
    
    const confirmUnlink = window.confirm("Are you sure you want to disconnect this physical QR code? It will become available for anyone to claim.");
    if (!confirmUnlink) return;

    setUnlinkLoading(true);
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({
          user_id: null,
          assigned_profile_id: null,
          custom_url: null,
          status: 'available'
        })
        .eq('id', qrData.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("QR Code successfully unlinked.");
      setQrData(null);
      setScannedCode('');
      setScanState('idle');
    } catch (err: any) {
      console.error("Error unlinking QR code:", err);
      toast.error(err.message || "Failed to unlink QR code.");
    } finally {
      setUnlinkLoading(false);
    }
  };

  const [dynamicCodesCount, setDynamicCodesCount] = useState<number>(0);

  const fetchDynamicCodesCount = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('qr_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .like('code', 'DYN_%');
      if (error) throw error;
      setDynamicCodesCount(count || 0);
    } catch (err) {
      console.error("Error fetching dynamic QR count:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDynamicCodesCount();
    }
  }, [user]);

  const isDownloadDisabled = isDynamic && !isDynamicSaved;

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
      <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto px-4 pb-4">
        <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
          Free Custom generator
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
          Create Custom QR Codes in Seconds
        </h1>
        <p className="text-sm sm:text-base font-semibold text-zinc-500 mt-4 leading-relaxed max-w-xl mx-auto">
          Paste your link, customize your QR, and download instantly. No login required.
        </p>

        {/* Dynamic QR CTA */}
        <div className="mt-10 flex flex-col items-center justify-center relative group max-w-lg mx-auto">
          {/* Animated Background Blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
          
          <Link to="/pricing" className="relative w-full">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 py-5 sm:py-6 rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-orange-600 text-white shadow-2xl shadow-orange-500/25 border border-white/20 relative overflow-hidden"
            >
              {/* Glass reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
              
              <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/10 shrink-0">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Premium Feature</span>
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl tracking-tight leading-none text-white drop-shadow-sm">
                    Get Your Dynamic QR
                  </h3>
                  <p className="text-sm font-medium text-white/90 mt-1.5 leading-snug">
                    Connect anything to your QR. Change the link anytime without reprinting!
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-md group-hover:bg-white/30 transition-colors shrink-0">
                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          </Link>
          
          {/* Floating animated elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 sm:-left-10 top-0 sm:top-2 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl shadow-pink-500/10 border border-zinc-100 rotate-[-12deg]"
          >
            <Instagram className="w-6 h-6 text-pink-500" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 12, 0] }} 
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-4 sm:-right-8 -top-4 sm:-top-2 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl shadow-blue-500/10 border border-zinc-100 rotate-[10deg]"
          >
            <Globe className="w-6 h-6 text-blue-500" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [5, 10, 5] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-4 sm:right-6 -bottom-6 sm:-bottom-8 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl shadow-emerald-500/10 border border-zinc-100"
          >
            <CreditCard className="w-6 h-6 text-emerald-500" />
          </motion.div>
        </div>

      </div>

      {mode === 'create' ? (
        <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Customizer Panel */}
        <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          
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
                    <div className="w-7 h-7 rounded-full border border-zinc-300 bg-gradient-to-tr from-rose-500 via-emerald-500 to-blue-500 relative flex items-center justify-center cursor-pointer hover:scale-105 overflow-hidden">
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
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 order-1 lg:order-2">
          
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
                disabled={isDownloadDisabled}
                className="flex-1 h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Link
              </Button>
            </div>

            {/* Download actions */}
            <div className="w-full border-t border-zinc-150 pt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => handleDownload('png')}
                disabled={isDownloadDisabled}
                className="h-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" /> PNG
              </Button>
              <Button
                type="button"
                onClick={() => handleDownload('svg')}
                disabled={isDownloadDisabled}
                className="h-11 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" /> SVG
              </Button>
            </div>

          </Card>

          {/* Make it Dynamic Instant CTA */}
          <Card className="bg-gradient-to-br from-orange-500 to-rose-500 border-0 rounded-[2.5rem] shadow-xl shadow-orange-500/20 p-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            
            <div className="bg-white/95 backdrop-blur-md rounded-[2.3rem] p-6 text-center relative z-10 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 text-white shadow-lg shadow-orange-500/20">
                <Sparkles className="h-7 w-7" />
              </div>
              
              <div>
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">Make it Dynamic</h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1 px-2">
                  Edit destination anytime without re-printing, track scans, and more.
                </p>
              </div>

              {userDynamicQrs.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-100">
                    You have an active Dynamic QR!
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                  >
                    Manage in Dashboard
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateDynamicQR}
                  disabled={savingLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {savingLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Generate Dynamic QR"
                  )}
                </Button>
              )}
            </div>
          </Card>

            {isDownloadDisabled && (
              <p className="text-[10px] text-amber-600 font-semibold text-center mt-2 animate-pulse bg-amber-500/5 py-1.5 px-3 rounded-lg border border-amber-500/10">
                ⚠️ Click "Generate Dynamic QR" first to copy or download.
              </p>
            )}

        </aside>
      </main>
      ) : (
        <main className="max-w-2xl mx-auto px-4 pb-12 animate-in fade-in duration-300">
          <Card className="bg-white border-zinc-200/80 rounded-[2.5rem] shadow-sm p-6 sm:p-8 text-center space-y-6">
            
            {/* IDLE STATE */}
            {scanState === 'idle' && (
              <div className="space-y-6 py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm animate-pulse">
                  <QrCode className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Connect Physical QR Code</h2>
                  <p className="text-xs sm:text-sm text-zinc-500 font-semibold leading-relaxed max-w-md mx-auto">
                    Claim and manage your printed Portid card, sticker, or stand by scanning the QR code using your device's camera.
                  </p>
                </div>

                <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
                  {user ? (
                    <Button
                      onClick={startScanner}
                      className="h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      <Camera className="h-4 w-4" /> Start Camera Scanner
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
                        You must be logged in to claim and link physical QR codes to your account.
                      </p>
                      <Button
                        asChild
                        className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20"
                      >
                        <Link to="/login" state={{ from: { pathname: '/qr-code-generator' } }}>
                          Log In to Connect
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Manual fallback input */}
                  {user && (
                    <div className="pt-6 border-t border-zinc-100 mt-4 space-y-3">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                        Or enter code ID manually
                      </span>
                      <form onSubmit={handleManualVerify} className="flex gap-2">
                        <Input
                          placeholder="e.g. DYN_ABCDEF"
                          value={manualCodeInput}
                          onChange={(e) => setManualCodeInput(e.target.value)}
                          className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 bg-zinc-50 font-mono text-xs uppercase"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 font-bold text-xs uppercase tracking-wider px-4"
                        >
                          Verify
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCANNING STATE */}
            {scanState === 'scanning' && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Scan Physical QR Code</h2>
                  <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                    Point your device's camera at the printed Portid QR code.
                  </p>
                </div>

                <div className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-orange-500 bg-zinc-950 flex items-center justify-center shadow-lg">
                  {/* Camera Video Node */}
                  <div id="qr-reader" className="w-full h-full" />
                  
                  {/* Overlay scanning reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[60%] h-[60%] border-2 border-orange-500 rounded-2xl relative shadow-[0_0_0_9999px_rgba(9,9,11,0.5)]">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white rounded-br" />
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    stopScanner();
                    setScanState('idle');
                  }}
                  className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-bold text-xs uppercase tracking-wider px-6"
                >
                  Cancel Scanner
                </Button>
              </div>
            )}

            {/* CHECKING STATE */}
            {scanState === 'checking' && (
              <div className="py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Verifying code in database...
                </p>
              </div>
            )}

            {/* UNASSIGNED/AVAILABLE STATE */}
            {scanState === 'unassigned' && (
              <div className="space-y-6 text-left max-w-md mx-auto py-2">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">QR Code Available!</h2>
                  <p className="text-xs text-zinc-500 font-semibold">
                    Code: <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">{scannedCode}</code>
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">
                    Select Destination Type
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConnectType('profile')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                        connectType === 'profile'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <User className="h-5 w-5 mb-1" />
                      <span className="text-xs font-bold">Portid Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectType('url')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                        connectType === 'url'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <LinkIcon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-bold">Custom URL</span>
                    </button>
                  </div>

                  {connectType === 'profile' && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-1">
                        Connect to Portid Profile
                      </label>
                      {userProfiles.length === 0 ? (
                        <div className="space-y-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 text-center">
                          <p className="text-[11px] text-zinc-400 leading-normal">
                            You don't have any business profiles. Create one to link this dynamic QR code.
                          </p>
                          <Button asChild className="h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            <Link to="/create-profile">Create Profile</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="w-full h-11 pl-3 pr-10 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-850 text-xs font-bold focus:border-orange-500 focus:outline-none appearance-none cursor-pointer"
                          >
                            {userProfiles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.brand_name} (/{p.slug})
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {connectType === 'url' && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-1">
                        Target Custom URL
                      </label>
                      <Input
                        placeholder="https://mywebsite.com"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="h-11 rounded-xl border-zinc-200 focus:border-orange-500 bg-zinc-50 text-xs font-semibold"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-150">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setQrData(null);
                      setScannedCode('');
                      setScanState('idle');
                    }}
                    className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConnectQR}
                    disabled={connectLoading || (connectType === 'profile' && userProfiles.length === 0)}
                    className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                  >
                    {connectLoading ? (
                      <div className="flex items-center gap-1 justify-center">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <span>Connect QR Code</span>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ASSIGNED STATE */}
            {scanState === 'assigned' && (
              <div className="space-y-6 text-left max-w-md mx-auto py-2">
                {qrData?.user_id === user?.id ? (
                  /* OWNED BY ME STATE */
                  <>
                    <div className="text-center space-y-2">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm">
                        <Check className="h-6 w-6 stroke-[3]" />
                      </div>
                      <h2 className="text-xl font-black text-zinc-900 tracking-tight">QR Connected to Your Account</h2>
                      <p className="text-xs text-zinc-500 font-semibold">
                        Code ID: <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">{scannedCode}</code>
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <div className="p-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                          Current Destination
                        </span>
                        {qrData?.assigned_profile_id ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-800">{qrData?.profiles?.brand_name || 'Portid Profile'}</p>
                              <p className="text-[10px] text-zinc-500 font-semibold">/{qrData?.profiles?.slug}</p>
                            </div>
                            <Button asChild variant="link" className="h-auto p-0 text-xs text-blue-650 hover:text-blue-750 font-bold uppercase tracking-wider">
                              <a href={`/p/${qrData?.profiles?.slug}`} target="_blank" rel="noopener noreferrer">
                                View <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="overflow-hidden max-w-[80%]">
                              <p className="text-xs font-bold text-zinc-850 truncate">{qrData?.custom_url}</p>
                              <p className="text-[10px] text-zinc-500 font-semibold">Custom Redirect URL</p>
                            </div>
                            <Button asChild variant="link" className="h-auto p-0 text-xs text-blue-650 hover:text-blue-750 font-bold uppercase tracking-wider">
                              <a href={qrData?.custom_url} target="_blank" rel="noopener noreferrer">
                                Visit <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-150">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setQrData(null);
                          setScannedCode('');
                          setScanState('idle');
                        }}
                        className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 font-bold text-xs uppercase tracking-wider"
                      >
                        Scan Another
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUnlinkQR}
                        disabled={unlinkLoading}
                        className="h-11 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider"
                      >
                        {unlinkLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          <span>Disconnect QR</span>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* OWNED BY SOMEONE ELSE STATE */
                  <>
                    <div className="text-center space-y-2">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-black text-zinc-900 tracking-tight">QR Already Connected</h2>
                      <p className="text-xs sm:text-sm text-zinc-500 font-semibold">
                        This physical QR code is linked to another user's account.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <div className="p-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                          Connection Details
                        </span>
                        {qrData?.assigned_profile_id ? (
                          <div>
                            <p className="text-xs font-bold text-zinc-700">Linked to Profile</p>
                            <p className="text-[10px] text-zinc-400 font-semibold">Portid Profile slug: /{qrData?.profiles?.slug}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold text-zinc-700">Custom Redirect Destination</p>
                            <p className="text-[10px] text-zinc-400 font-semibold">This QR connects to a custom link destination.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-150 text-center">
                      <Button
                        type="button"
                        onClick={() => {
                          setQrData(null);
                          setScannedCode('');
                          setScanState('idle');
                        }}
                        className="w-full h-11 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider"
                      >
                        Scan Another QR
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SUCCESS STATE */}
            {scanState === 'success' && (
              <div className="space-y-6 text-left max-w-md mx-auto py-2">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 animate-bounce">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Successfully Connected!</h2>
                  <p className="text-xs sm:text-sm text-zinc-500 font-semibold">
                    Your physical QR code is now linked and active.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="p-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                      Target Destination
                    </span>
                    {qrData?.assigned_profile_id ? (
                      <p className="text-xs font-bold text-zinc-800">
                        Portid Profile: {qrData?.profiles?.brand_name || 'Profile'} (/{qrData?.profiles?.slug})
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-zinc-850 truncate">
                        Custom URL: {qrData?.custom_url}
                      </p>
                    )}
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block pt-2">
                      QR Code ID
                    </span>
                    <p className="text-xs font-mono font-bold text-zinc-800">{scannedCode}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-150 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setQrData(null);
                      setScannedCode('');
                      setScanState('idle');
                    }}
                    variant="outline"
                    className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 font-bold text-xs uppercase tracking-wider"
                  >
                    Scan Another
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setScanState('assigned');
                    }}
                    className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20"
                  >
                    Manage Settings
                  </Button>
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {scanState === 'error' && (
              <div className="space-y-6 text-center max-w-sm mx-auto py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-lg font-black text-zinc-900 tracking-tight">Scan/Validation Error</h2>
                  <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                    {scannerError || "An unexpected error occurred during database verification."}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setScanState('idle');
                      setScannerError('');
                    }}
                    className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Try Again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMode('create');
                      setScanState('idle');
                      setScannerError('');
                    }}
                    className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 font-bold text-xs uppercase tracking-wider"
                  >
                    Back to Generator
                  </Button>
                </div>
              </div>
            )}

          </Card>
        </main>
      )}

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
