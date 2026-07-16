import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Shield, LogOut, Users, BarChart3, Eye, MousePointerClick,
  ExternalLink, Trash2, Search, ChevronDown, ChevronRight,
  User, Star, MessageSquare, Mail, Phone, Calendar, Crown,
  FileSpreadsheet, Check, ShieldAlert, Settings, Layout, Download,
  Plus, QrCode, ArrowLeft, HelpCircle, CheckCircle
} from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeStyle {
  color: string;
  dotsType: string;
  cornersSquareType: string;
  cornersDotType: string;
  fileFormat: 'png' | 'svg' | 'jpeg' | 'webp';
  transparent?: boolean;
}

interface QRCodeData {
  id: string;
  code: string;
  status: 'available' | 'assigned';
  assigned_profile_id: string | null;
  custom_url: string | null;
  created_at: string;
  name: string | null;
  style: QRCodeStyle | null;
  profiles: {
    id: string;
    brand_name: string;
    slug: string;
  } | null;
}

interface QRCodeLivePreviewProps {
  code: string;
  color: string;
  dotsType: string;
  cornersSquareType: string;
  cornersDotType: string;
  transparent?: boolean;
}

const QRCodeLivePreview: React.FC<QRCodeLivePreviewProps> = ({
  code,
  color,
  dotsType,
  cornersSquareType,
  cornersDotType,
  transparent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstanceRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/q/${code}`;
    
    const qrCode = new QRCodeStyling({
      width: 240,
      height: 240,
      type: 'svg',
      data: url,
      margin: 15,
      dotsOptions: {
        color: color,
        type: dotsType as any,
      },
      cornersSquareOptions: {
        color: color,
        type: cornersSquareType as any,
      },
      cornersDotOptions: {
        color: color,
        type: cornersDotType as any,
      },
      backgroundOptions: {
        color: transparent ? 'transparent' : '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10
      }
    });

    qrCodeInstanceRef.current = qrCode;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qrCode.append(containerRef.current);
    }
  }, [code, transparent]);

  useEffect(() => {
    if (qrCodeInstanceRef.current) {
      qrCodeInstanceRef.current.update({
        dotsOptions: {
          color: color,
          type: dotsType as any,
        },
        cornersSquareOptions: {
          color: color,
          type: cornersSquareType as any,
        },
        cornersDotOptions: {
          color: color,
          type: cornersDotType as any,
        },
        backgroundOptions: {
          color: transparent ? 'transparent' : '#ffffff',
        }
      });
    }
  }, [color, dotsType, cornersSquareType, cornersDotType, transparent]);

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-[2rem] shadow-inner transition-all ${
      transparent ? 'bg-[#f4f4f5]' : 'bg-white'
    }`}
    style={transparent ? {
      backgroundImage: 'linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)',
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
    } : undefined}>
      <div ref={containerRef} className="w-[240px] h-[240px] flex items-center justify-center" />
    </div>
  );
};

interface Profile {
  id: string;
  brand_name: string;
  slug: string;
  category: string | null;
  theme: string;
  layout?: string;
  logo_url: string | null;
  user_id: string;
  created_at: string;
  is_premium: boolean;
  email?: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

interface AnalyticsEvent {
  id: string;
  profile_id: string;
  event_type: string;
  button_name: string | null;
  created_at: string;
}

interface UserPlan {
  user_id: string;
  plan_tier: 'basic' | 'premium';
  expires_at: string | null;
  billing_cycle: 'monthly' | 'yearly' | 'manual' | null;
}

interface SupportEnquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'pending' | 'seen' | 'resolved';
  created_at: string;
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

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [enquiries, setEnquiries] = useState<SupportEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Controls
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'profiles' | 'analytics' | 'enquiries' | 'subscriptions' | 'qrcodes'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'pending' | 'seen' | 'resolved'>('all');

  // Subscription filters
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'lifetime'>('all');
  const [subCycleFilter, setSubCycleFilter] = useState<'all' | 'monthly' | 'yearly' | 'manual'>('all');
  const [subTierFilter, setSubTierFilter] = useState<'all' | 'basic' | 'premium'>('all');

  // Manage plan modal controls
  const [managePlanUser, setManagePlanUser] = useState<string | null>(null);
  const [managePlanTier, setManagePlanTier] = useState<'basic' | 'premium'>('basic');
  const [managePlanCycle, setManagePlanCycle] = useState<'monthly' | 'yearly' | 'manual' | 'none'>('none');
  const [managePlanExpiryOption, setManagePlanExpiryOption] = useState<'lifetime' | '30days' | '365days' | 'custom'>('lifetime');
  const [managePlanCustomExpiry, setManagePlanCustomExpiry] = useState<string>('');

  // QR state variables
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [newQrName, setNewQrName] = useState('');
  const [newQrType, setNewQrType] = useState<'none' | 'profile' | 'custom'>('none');
  const [newQrProfileId, setNewQrProfileId] = useState('');
  const [newQrCustomUrl, setNewQrCustomUrl] = useState('');
  const [newQrProfileSearchQuery, setNewQrProfileSearchQuery] = useState('');

  // customize styles state
  const [qrColor, setQrColor] = useState('#f97316');
  const [qrDotsType, setQrDotsType] = useState('rounded');
  const [qrCornersSquareType, setQrCornersSquareType] = useState('extra-rounded');
  const [qrCornersDotType, setQrCornersDotType] = useState('dot');
  const [qrFileFormat, setQrFileFormat] = useState<'png' | 'svg' | 'jpeg' | 'webp'>('png');
  const [qrTransparent, setQrTransparent] = useState(false);

  const resetQRStyle = () => {
    setQrColor('#f97316');
    setQrDotsType('rounded');
    setQrCornersSquareType('extra-rounded');
    setQrCornersDotType('dot');
    setQrFileFormat('png');
    setQrTransparent(false);
  };

  // modal overlays
  const [linkLoading, setLinkLoading] = useState(false);
  const [customizingQr, setCustomizingQr] = useState<QRCodeData | null>(null);
  const [assigningQr, setAssigningQr] = useState<QRCodeData | null>(null);
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [qrStatusFilter, setQrStatusFilter] = useState<'all' | 'available' | 'assigned'>('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profilesRes, usersRes, plansRes, analyticsRes, enquiriesRes, qrCodesRes] = await Promise.all([
        supabase.from('profiles').select('id, brand_name, slug, category, theme, layout, logo_url, user_id, created_at, is_premium, email').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*').order('user_id'),
        supabase.from('user_plans').select('user_id, plan_tier, expires_at, billing_cycle'),
        supabase.from('analytics').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('support_enquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('qr_codes').select('*, profiles(id, brand_name, slug)').order('created_at', { ascending: false }),
      ]);

      setProfiles(profilesRes.data ?? []);
      setUsers(usersRes.data ?? []);
      setUserPlans(plansRes.data as UserPlan[] ?? []);
      setAnalytics(analyticsRes.data ?? []);
      setEnquiries((enquiriesRes.data as unknown as SupportEnquiry[]) ?? []);
      setQrCodes((qrCodesRes.data as unknown as QRCodeData[]) || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Failed to load administration data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*, profiles(id, brand_name, slug)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQrCodes((data as unknown as QRCodeData[]) || []);
    } catch (err: any) {
      console.error("Error fetching QR codes:", err);
    }
  };

  const getNextStandCode = () => {
    const prefixCodes = qrCodes.map(q => q.code).filter(c => c.startsWith('STAND'));
    let maxNum = 0;
    prefixCodes.forEach(code => {
      const numPart = code.substring(5);
      if (/^\d+$/.test(numPart)) {
        const num = parseInt(numPart, 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `STAND${String(maxNum + 1).padStart(3, '0')}`;
  };

  const handleCreateQRCode = async () => {
    const codeToCreate = getNextStandCode();
    
    if (qrCodes.some(q => q.code.toUpperCase() === codeToCreate.toUpperCase())) {
      toast.error(`QR Code "${codeToCreate}" already exists.`);
      return;
    }

    if (newQrType === 'profile' && !newQrProfileId) {
      toast.error("Please select a Portid profile to link.");
      return;
    }

    if (newQrType === 'custom' && !newQrCustomUrl.trim()) {
      toast.error("Please enter a custom destination URL.");
      return;
    }
    
    setCreatorLoading(true);
    try {
      const stylePayload: QRCodeStyle = {
        color: qrColor,
        dotsType: qrDotsType,
        cornersSquareType: qrCornersSquareType,
        cornersDotType: qrCornersDotType,
        fileFormat: qrFileFormat,
        transparent: qrTransparent
      };
      const payload: any = {
        code: codeToCreate,
        name: newQrName.trim() || null,
        assigned_profile_id: newQrType === 'profile' && newQrProfileId ? newQrProfileId : null,
        custom_url: newQrType === 'custom' && newQrCustomUrl.trim() ? newQrCustomUrl.trim() : null,
        style: stylePayload
      };
      
      const { error } = await supabase
        .from('qr_codes')
        .insert(payload);
        
      if (error) throw error;
      
      toast.success(`Successfully created QR code ${payload.code}.`);
      await fetchQrCodes();
      setIsGeneratingQr(false);
      setNewQrName('');
      setNewQrType('none');
      setNewQrProfileId('');
      setNewQrCustomUrl('');
      setNewQrProfileSearchQuery('');
      setQrColor('#f97316');
      setQrDotsType('rounded');
      setQrCornersSquareType('extra-rounded');
      setQrCornersDotType('dot');
      setQrFileFormat('png');
      setQrTransparent(false);
    } catch (err: any) {
      console.error("Error creating QR code:", err);
      toast.error(err.message || "Failed to create QR code.");
    } finally {
      setCreatorLoading(false);
    }
  };

  const handleUpdateQRLink = async (qrId: string, profileId: string | null, customUrl: string | null) => {
    setLinkLoading(true);
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({
          assigned_profile_id: profileId,
          custom_url: customUrl,
        })
        .eq('id', qrId);

      if (error) throw error;

      toast.success("Successfully updated QR code link.");
      await fetchQrCodes();
      setAssigningQr(null);
      setProfileSearchQuery('');
      setCustomLinkUrl('');
    } catch (err: any) {
      console.error("Error updating QR code:", err);
      toast.error(err.message || "Failed to update QR code.");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDeleteQrCode = async (qrId: string) => {
    if (!window.confirm("Are you sure you want to delete this QR code?")) return;
    const toastId = toast.loading("Deleting QR code...");
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId);

      if (error) throw error;

      toast.success("Successfully deleted QR code.", { id: toastId });
      await fetchQrCodes();
    } catch (err: any) {
      console.error("Error deleting QR code:", err);
      toast.error(err.message || "Failed to delete QR code.", { id: toastId });
    }
  };

  const handleDownloadQRWithStyle = async (code: string, design: QRCodeStyle) => {
    try {
      const url = `${window.location.origin}/q/${code}`;
      const qrCode = new QRCodeStyling({
        width: 1024,
        height: 1024,
        type: design.fileFormat === 'svg' ? 'svg' : 'canvas',
        data: url,
        margin: 100,
        dotsOptions: {
          color: design.color || '#f97316',
          type: (design.dotsType || 'rounded') as any
        },
        cornersSquareOptions: {
          color: design.color || '#f97316',
          type: (design.cornersSquareType || 'extra-rounded') as any
        },
        cornersDotOptions: {
          color: design.color || '#f97316',
          type: (design.cornersDotType || 'dot') as any
        },
        backgroundOptions: {
          color: design.transparent ? 'transparent' : '#ffffff',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 20
        }
      });

      await qrCode.download({
        name: `qr-code-${code}`,
        extension: design.fileFormat || 'png'
      });
      toast.success(`Successfully downloaded QR code stand ${code}`);
    } catch (err) {
      console.error("Error downloading QR:", err);
      toast.error("Failed to download QR code image.");
    }
  };

  const handleDownloadQR = async (code: string) => {
    const qrData = qrCodes.find(q => q.code === code);
    const defaultStyle: QRCodeStyle = {
      color: '#f97316',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      fileFormat: 'png',
      transparent: false
    };
    const style = qrData?.style ? { ...defaultStyle, ...qrData.style } : defaultStyle;
    await handleDownloadQRWithStyle(code, style);
  };

  const handleSaveQRStyle = async (qrId: string, style: QRCodeStyle) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ style: style as any })
        .eq('id', qrId);

      if (error) throw error;

      toast.success("QR Code style layout successfully saved.");
      await fetchQrCodes();
      setCustomizingQr(null);
      resetQRStyle();
    } catch (err: any) {
      console.error("Error saving style:", err);
      toast.error("Failed to save QR code style layout.");
    }
  };

  const handleDeleteProfile = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the profile "${name}"? This action is permanent.`)) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Profile "${name}" was successfully deleted.`);
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePlan = async (
    userId: string, 
    newTier: 'basic' | 'premium',
    billingCycle?: 'monthly' | 'yearly' | 'manual' | null,
    expiresAt?: string | null
  ) => {
    const existing = userPlans.find(p => p.user_id === userId);
    
    // Resolve billing cycle and expires_at if not explicitly provided
    const resolvedCycle = billingCycle !== undefined 
      ? billingCycle 
      : (newTier === 'basic' ? null : (existing?.billing_cycle || 'manual'));
      
    const resolvedExpiresAt = expiresAt !== undefined 
      ? expiresAt 
      : (newTier === 'basic' ? null : (existing?.expires_at || null));

    const { error } = await supabase
      .from('user_plans')
      .upsert({ 
        user_id: userId, 
        plan_tier: newTier,
        billing_cycle: resolvedCycle,
        expires_at: resolvedExpiresAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`User plan updated to ${newTier.toUpperCase()}`);
    setUserPlans(prev => {
      const exists = prev.some(p => p.user_id === userId);
      const updatedItem: UserPlan = { 
        user_id: userId, 
        plan_tier: newTier, 
        billing_cycle: resolvedCycle, 
        expires_at: resolvedExpiresAt 
      };
      if (exists) {
        return prev.map(p => p.user_id === userId ? { ...p, ...updatedItem } : p);
      } else {
        return [...prev, updatedItem];
      }
    });
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole as "admin" | "user" }, { onConflict: 'user_id' });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`User role upgraded to ${newRole.toUpperCase()}`);
    setUsers(prev => {
      const exists = prev.some(u => u.user_id === userId);
      if (exists) {
        return prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u);
      } else {
        return [...prev, { id: Math.random().toString(), user_id: userId, role: newRole }];
      }
    });
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: 'pending' | 'seen' | 'resolved') => {
    const { error } = await supabase.from('support_enquiries').update({ status: newStatus }).eq('id', id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Request marked as ${newStatus.toUpperCase()}`);
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Metrics Calculations
  const totalViews = analytics.filter(a => a.event_type === 'view').length;
  const totalClicks = analytics.filter(a => a.event_type === 'button_click').length;
  const globalCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';
  const pendingEnquiriesCount = enquiries.filter(e => e.status === 'pending').length;

  // Process data for charts
  const getDailyChartData = () => {
    const filteredEvents = selectedProfileId
      ? analytics.filter(a => a.profile_id === selectedProfileId)
      : analytics;

    const dayMap: Record<string, { date: string; views: number; clicks: number }> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last30Days.forEach(date => {
      dayMap[date] = {
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        views: 0,
        clicks: 0
      };
    });

    filteredEvents.forEach(e => {
      const date = e.created_at.split('T')[0];
      if (dayMap[date]) {
        if (e.event_type === 'view') dayMap[date].views++;
        else if (e.event_type === 'button_click') dayMap[date].clicks++;
      }
    });

    return Object.values(dayMap);
  };

  const getTopButtonsData = () => {
    const filteredEvents = selectedProfileId
      ? analytics.filter(a => a.profile_id === selectedProfileId)
      : analytics;

    const btnMap: Record<string, number> = {};
    filteredEvents.filter(a => a.event_type === 'button_click' && a.button_name).forEach(a => {
      btnMap[a.button_name!] = (btnMap[a.button_name!] || 0) + 1;
    });

    return Object.entries(btnMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const exportToCSV = (type: 'analytics' | 'leads' | 'profiles') => {
    let csvContent = "";
    let fileName = "";

    if (type === 'analytics') {
      csvContent = "Event Type,Button Name,Timestamp,Profile ID\n" +
        analytics.map(e => `${e.event_type},${e.button_name || 'N/A'},${e.created_at},${e.profile_id}`).join("\n");
      fileName = "portid_admin_analytics_report.csv";
    } else if (type === 'profiles') {
      csvContent = "Brand Name,Slug,Category,Theme,Layout,Premium,Created At\n" +
        profiles.map(p => `"${p.brand_name}",${p.slug},${p.category || 'N/A'},${p.theme},${p.layout || 'classic'},${p.is_premium},${p.created_at}`).join("\n");
      fileName = "portid_admin_profiles_directory.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report downloaded successfully!");
  };

  // Filtered Lists
  const filteredUsers = users.filter(u =>
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p =>
    p.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnquiries = enquiries.filter(e => {
    if (enquiryFilter !== 'all' && e.status !== enquiryFilter) return false;
    if (searchQuery) {
      return e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const resolvedSubscriptions = users.map(u => {
    const plan = userPlans.find(p => p.user_id === u.user_id);
    const profile = profiles.find(p => p.user_id === u.user_id);
    
    // Calculate expiration info
    const expiresAt = plan?.expires_at ? new Date(plan.expires_at) : null;
    const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false;
    const isLifetime = plan?.plan_tier === 'premium' && !expiresAt;
    
    let status: 'active' | 'expiring' | 'expired' | 'basic' = 'basic';
    let daysRemaining: number | null = null;
    let timeString = '';
    
    if (plan?.plan_tier === 'premium') {
      if (isLifetime) {
        status = 'active';
      } else if (expiresAt) {
        const diffMs = expiresAt.getTime() - Date.now();
        daysRemaining = diffMs / (1000 * 60 * 60 * 24);
        
        if (isExpired) {
          status = 'expired';
        } else if (daysRemaining <= 7) {
          status = 'expiring';
        } else {
          status = 'active';
        }
        
        if (isExpired) {
          const agoDays = Math.abs(Math.floor(daysRemaining));
          timeString = agoDays === 0 ? "Expired today" : `Expired ${agoDays}d ago`;
        } else {
          const leftDays = Math.floor(daysRemaining);
          const leftHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          if (leftDays === 0) {
            timeString = `${leftHours}h left`;
          } else {
            timeString = `${leftDays}d, ${leftHours}h left`;
          }
        }
      }
    }
    
    return {
      userId: u.user_id,
      role: u.role,
      planTier: plan?.plan_tier || 'basic',
      billingCycle: plan?.billing_cycle || null,
      expiresAt: plan?.expires_at || null,
      profile,
      status,
      daysRemaining,
      timeString,
      isLifetime
    };
  });

  // Filtered Subscriptions
  const filteredSubscriptions = resolvedSubscriptions.filter(s => {
    // Search query matches User ID, Email, Brand Name, or Slug
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchUserId = s.userId.toLowerCase().includes(query);
      const matchBrandName = s.profile?.brand_name?.toLowerCase()?.includes(query) || false;
      const matchSlug = s.profile?.slug?.toLowerCase()?.includes(query) || false;
      const matchEmail = s.profile?.email?.toLowerCase()?.includes(query) || false;
      if (!matchUserId && !matchBrandName && !matchSlug && !matchEmail) return false;
    }
    
    // Status filter
    if (subStatusFilter !== 'all') {
      if (subStatusFilter === 'active' && (s.planTier !== 'premium' || s.status === 'expired')) return false;
      if (subStatusFilter === 'expiring' && s.status !== 'expiring') return false;
      if (subStatusFilter === 'expired' && s.status !== 'expired') return false;
      if (subStatusFilter === 'lifetime' && (!s.isLifetime || s.planTier !== 'premium')) return false;
    }
    
    // Cycle filter
    if (subCycleFilter !== 'all' && s.billingCycle !== subCycleFilter) return false;
    
    // Plan tier filter
    if (subTierFilter !== 'all' && s.planTier !== subTierFilter) return false;
    
    return true;
  });

  const filteredQrCodes = qrCodes.filter(q => {
    if (qrStatusFilter !== 'all' && q.status !== qrStatusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchCode = q.code.toLowerCase().includes(query);
      const matchName = q.name?.toLowerCase().includes(query) || false;
      const matchProfileName = q.profiles?.brand_name?.toLowerCase().includes(query) || false;
      const matchProfileSlug = q.profiles?.slug?.toLowerCase().includes(query) || false;
      const matchCustomUrl = q.custom_url?.toLowerCase().includes(query) || false;
      return matchCode || matchName || matchProfileName || matchProfileSlug || matchCustomUrl;
    }
    return true;
  });

  // Calculate Metrics
  const activePremiumCount = resolvedSubscriptions.filter(s => s.planTier === 'premium' && s.status !== 'expired').length;
  const monthlyCount = resolvedSubscriptions.filter(s => s.planTier === 'premium' && s.status !== 'expired' && s.billingCycle === 'monthly').length;
  const yearlyCount = resolvedSubscriptions.filter(s => s.planTier === 'premium' && s.status !== 'expired' && s.billingCycle === 'yearly').length;
  const expiringSoonCount = resolvedSubscriptions.filter(s => s.planTier === 'premium' && s.status === 'expiring').length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#070708] overflow-hidden text-zinc-100 font-sans">

      {/* Docked Sidebar (Desktop Command Center) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#0c0c0e] border-r border-zinc-900 shrink-0 z-20">
        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-zinc-900 justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            <span className="font-heading text-base font-extrabold tracking-tight">Portid <strong className="text-orange-500">Admin</strong></span>
          </div>
          <span className="bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-orange-500 tracking-wider">
            Command
          </span>
        </div>

        {/* Navigation Sidebar List */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Management</p>

          {[
            { id: 'dashboard', label: 'Overview', icon: Layout },
            { id: 'users', label: 'User Accounts', icon: Users },
            { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
            { id: 'profiles', label: 'Profiles DB', icon: User },
            { id: 'analytics', label: 'Analytics Engine', icon: BarChart3 },
            { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-extrabold tracking-tight transition-all text-left ${activeTab === item.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </button>
          ))}

          <div className="pt-4">
            <p className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Support CRM</p>
            <button
              onClick={() => { setActiveTab('enquiries'); setSearchQuery(''); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-extrabold tracking-tight transition-all text-left ${activeTab === 'enquiries'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
            >
              <span className="flex items-center gap-3.5">
                <MessageSquare className="h-4.5 w-4.5 shrink-0" />
                Help Desk
              </span>
              {pendingEnquiriesCount > 0 && (
                <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {pendingEnquiriesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-900">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-zinc-900 shrink-0 bg-[#070708]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Navigation Toggle */}
            <div className="lg:hidden flex items-center gap-2 mr-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="font-heading text-sm font-extrabold">Portid Admin</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-zinc-400 text-sm font-bold">
              <span>System Status:</span>
              <span className="flex items-center gap-1.5 text-emerald-500 font-extrabold">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" /> Operational
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Tab Select Switcher */}
            <select
              value={activeTab}
              onChange={(e) => { setActiveTab(e.target.value as any); setSearchQuery(''); }}
              className="lg:hidden text-xs font-black bg-zinc-900 border-zinc-800 rounded-xl px-3 py-2 text-orange-500 outline-none"
            >
              <option value="dashboard">Overview</option>
              <option value="users">Users Accounts</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="profiles">Profiles DB</option>
              <option value="analytics">Analytics Engine</option>
              <option value="qrcodes">QR Codes</option>
              <option value="enquiries">Help Desk</option>
            </select>

            <button
              onClick={() => exportToCSV('analytics')}
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-800 text-[11px] font-black uppercase tracking-wider bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Dump Logs
            </button>

            <button
              onClick={handleSignOut}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Dashboard Work Area */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-8 space-y-8 pb-12">

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Summary Hero Card */}
              <div className="relative rounded-[2rem] bg-gradient-to-br from-orange-600 via-orange-600/90 to-amber-700 p-8 sm:p-10 overflow-hidden shadow-xl shadow-orange-950/20 text-left">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute -left-10 -bottom-10 h-64 w-64 bg-zinc-950/20 blur-[50px] rounded-full" />

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                  <div>
                    <span className="inline-flex items-center gap-1 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-3">
                      Administrative Overview
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">Welcome to Portid Command Center</h2>
                    <p className="text-white/80 font-medium text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
                      Oversee system metrics, promote users to admin roles, upgrade plan tiers instantly, monitor network traffic and analytics, and respond to incoming customer help requests.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
                {[
                  { label: 'Total Users', count: users.length, icon: Users, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { label: 'Published Tags', count: profiles.length, icon: Star, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                  { label: 'Global Views', count: totalViews, icon: Eye, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                  { label: 'Global Clicks', count: totalClicks, icon: MousePointerClick, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                  { label: 'Average CTR', count: `${globalCtr}%`, icon: ShieldAlert, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                ].map((kpi, i) => (
                  <Card key={i} className="border-zinc-900 bg-[#0c0c0e] rounded-2xl hover:border-zinc-800 transition-all shadow-md">
                    <CardContent className="p-5 flex flex-col justify-between h-full text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{kpi.label}</span>
                        <div className={`p-2 rounded-xl border ${kpi.color}`}>
                          <kpi.icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-zinc-100 mt-6 tracking-tight">{kpi.count}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity Mini-Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Popular Profiles */}
                <Card className="border-zinc-900 bg-[#0c0c0e] rounded-3xl p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-sm font-black text-zinc-200 uppercase tracking-widest flex justify-between items-center">
                      🔥 Top Published Profiles
                      <Link to="/admin" onClick={() => setActiveTab('profiles')} className="text-[9px] font-black text-orange-500 uppercase hover:underline">View All</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <div className="space-y-3">
                      {profiles.slice(0, 4).map((p) => {
                        const views = analytics.filter(a => a.profile_id === p.id && a.event_type === 'view').length;
                        return (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-colors">
                            <div className="flex items-center gap-3">
                              {p.logo_url ? (
                                <img src={p.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                                  {p.brand_name.charAt(0)}
                                </div>
                              )}
                              <div className="text-left">
                                <p className="text-xs font-black text-zinc-100">{p.brand_name}</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">/{p.slug}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 border border-orange-500/10 px-2.5 py-1 rounded-md">
                              {views} views
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Support CRM overview */}
                <Card className="border-zinc-900 bg-[#0c0c0e] rounded-3xl p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-sm font-black text-zinc-200 uppercase tracking-widest flex justify-between items-center">
                      📬 Urgent Help Tickets
                      <Link to="/admin" onClick={() => setActiveTab('enquiries')} className="text-[9px] font-black text-orange-500 uppercase hover:underline">Inbox</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <div className="space-y-3">
                      {enquiries.slice(0, 3).map((e) => (
                        <div key={e.id} className="p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900 hover:border-zinc-800 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-zinc-200">{e.name}</span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${e.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                              {e.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed font-semibold">"{e.message}"</p>
                        </div>
                      ))}
                      {enquiries.length === 0 && (
                        <div className="py-12 text-center text-zinc-500 text-xs font-bold">No enquiries registered</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: USER ACCOUNTS (Role manager + Plan Tier Upsert) */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search accounts or roles…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-zinc-900/50 border-zinc-900 focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-sm font-semibold"
                  />
                </div>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Showing {filteredUsers.length} user accounts
                </span>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((u) => {
                  const userProfiles = profiles.filter(p => p.user_id === u.user_id);
                  const userPlan = userPlans.find(plan => plan.user_id === u.user_id);
                  const isExpanded = expandedUsers.has(u.user_id);

                  return (
                    <div key={u.id} className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] overflow-hidden hover:border-zinc-800 transition-all">
                      <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-4">
                        <button
                          onClick={() => toggleUserExpanded(u.user_id)}
                          className="flex items-center gap-4 text-left hover:opacity-80 transition-opacity flex-1 min-w-[200px]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-zinc-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-black text-zinc-100">{u.user_id}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${u.role === 'admin'
                                  ? 'bg-orange-500/10 border border-orange-500/15 text-orange-500'
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                                }`}>
                                {u.role}
                              </span>
                              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                                {userProfiles.length} active profile{userProfiles.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-4">
                          {/* Role Manager promotion drop box */}
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Account Role</span>
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.user_id, e.target.value)}
                              className="text-xs font-black bg-zinc-900 border-zinc-800 rounded-xl px-3 py-2 text-orange-500 cursor-pointer focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          {/* Plan tier dropdown */}
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Subscription Tier</span>
                            <select
                              value={userPlan?.plan_tier ?? 'basic'}
                              onChange={(e) => handleUpdatePlan(u.user_id, e.target.value as any)}
                              className="text-xs font-black bg-zinc-900 border-zinc-800 rounded-xl px-3 py-2 text-amber-500 cursor-pointer focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            >
                              <option value="basic">Basic (Free)</option>
                              <option value="premium">Premium</option>
                            </select>
                          </div>

                          <button
                            onClick={() => toggleUserExpanded(u.user_id)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl self-end mb-0.5 text-zinc-400 hover:text-zinc-200"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Accordion User Profiles View */}
                      {isExpanded && (
                        <div className="border-t border-zinc-900 bg-zinc-950/20 px-6 py-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 text-left">Published Tags</p>
                          {userProfiles.length === 0 ? (
                            <p className="text-xs font-bold text-zinc-500 text-left py-2">This user has not published any profiles yet.</p>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {userProfiles.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
                                  <div className="flex items-center gap-3">
                                    {p.logo_url ? (
                                      <img src={p.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                                    ) : (
                                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                                        {p.brand_name.charAt(0)}
                                      </div>
                                    )}
                                    <div className="text-left">
                                      <span className="text-xs font-black text-zinc-200">{p.brand_name}</span>
                                      <p className="text-[10px] text-zinc-500 font-extrabold uppercase mt-0.5">/{p.slug}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-zinc-200">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <button
                                      onClick={() => handleDeleteProfile(p.id, p.brand_name)}
                                      className="p-2 hover:bg-rose-500/10 rounded-xl text-zinc-500 hover:text-rose-500"
                                      title="Delete Profile"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="py-20 text-center text-zinc-500 font-extrabold text-sm">
                    No accounts match your query
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILES DIRECTORY (Tabular directory with themes/layouts) */}
          {activeTab === 'profiles' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search by name, slug or category…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-zinc-900/50 border-zinc-900 focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-sm font-semibold"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportToCSV('profiles')}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-800 text-[11px] font-black uppercase tracking-wider bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Directory
                  </button>
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    {filteredProfiles.length} profiles total
                  </span>
                </div>
              </div>

              {/* Profiles Table */}
              <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-[#0c0c0e] shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-zinc-900/50 text-zinc-500 font-black uppercase text-[10px] tracking-wider border-b border-zinc-900">
                      <tr>
                        <th className="px-6 py-4.5">Profile Info</th>
                        <th className="px-6 py-4.5">Category</th>
                        <th className="px-6 py-4.5">Plan Level</th>
                        <th className="px-6 py-4.5">Look & Feel</th>
                        <th className="px-6 py-4.5">Created Date</th>
                        <th className="px-6 py-4.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredProfiles.map(p => {
                        const views = analytics.filter(a => a.profile_id === p.id && a.event_type === 'view').length;
                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {p.logo_url ? (
                                  <img src={p.logo_url} alt="" className="h-9 w-9 rounded-xl object-cover border border-zinc-800" />
                                ) : (
                                  <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-xs border border-orange-500/10">
                                    {p.brand_name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <span className="text-xs font-black text-zinc-100 block leading-tight">{p.brand_name}</span>
                                  <span className="text-[10px] font-extrabold text-zinc-500 block mt-1 uppercase tracking-wider">/{p.slug}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-zinc-400 capitalize">
                              {p.category || 'Uncategorized'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${p.is_premium
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                                  : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                {p.is_premium ? 'Premium' : 'Basic'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                <span className="px-2 py-0.5 bg-zinc-900 rounded-md capitalize">{p.theme.split(':')[0]}</span>
                                <span className="px-2 py-0.5 bg-zinc-900 rounded-md capitalize">{p.layout || 'classic'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-zinc-500">
                              {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <a
                                  href={`/p/${p.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white"
                                  title="View Live Profile"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteProfile(p.id, p.brand_name)}
                                  className="p-2 hover:bg-rose-500/10 rounded-xl text-zinc-500 hover:text-rose-500"
                                  title="Purge Profile"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProfiles.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-zinc-500 font-extrabold text-sm">
                            No profiles published in directory
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS SUITE (Recharts line charts, top button clicks) */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              {/* Profile Selection list */}
              <div className="bg-[#0c0c0e] border border-zinc-900 rounded-3xl p-5 text-left">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3.5 px-1">Drill-Down Profile Analytics</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedProfileId === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedProfileId(null)}
                    className={`rounded-xl px-4 text-xs font-black uppercase tracking-wider transition-all ${selectedProfileId === null
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                  >
                    All System Traffic
                  </Button>
                  {profiles.slice(0, 10).map(p => (
                    <Button
                      key={p.id}
                      variant={selectedProfileId === p.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`rounded-xl px-4 text-xs font-black uppercase tracking-wider transition-all ${selectedProfileId === p.id
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                    >
                      {p.brand_name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dynamic metrics for selected selection */}
              {(() => {
                const chartData = getDailyChartData();
                const topButtons = getTopButtonsData();
                const filteredEvents = selectedProfileId
                  ? analytics.filter(a => a.profile_id === selectedProfileId)
                  : analytics;
                const views = filteredEvents.filter(a => a.event_type === 'view').length;
                const clicks = filteredEvents.filter(a => a.event_type === 'button_click').length;
                const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0';

                return (
                  <div className="space-y-8">
                    {/* Stat pills */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-5 text-left">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Views</span>
                        <p className="text-2xl font-black text-zinc-100 mt-2">{views}</p>
                      </div>
                      <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-5 text-left">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Clicks</span>
                        <p className="text-2xl font-black text-zinc-100 mt-2">{clicks}</p>
                      </div>
                      <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e] p-5 text-left col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">CTR</span>
                        <p className="text-2xl font-black text-zinc-100 mt-2">{ctr}%</p>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Main Traffic Area Chart */}
                      <Card className="xl:col-span-2 border-zinc-900 bg-[#0c0c0e] rounded-3xl p-5 text-left">
                        <CardHeader className="p-0 pb-4">
                          <CardTitle className="text-sm font-black text-zinc-200 uppercase tracking-widest">
                            📈 Views vs Clicks over Time
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4">
                          <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff782b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ff782b" stopOpacity={0} />
                                  </linearGradient>
                                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c21" vertical={false} />
                                <XAxis
                                  dataKey="date"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 10, fontWeight: 700, fill: '#52525b' }}
                                  minTickGap={25}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#52525b' }} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #1c1c21', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', color: '#fafafa', padding: '12px' }}
                                  itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                                />
                                <Area type="monotone" dataKey="views" name="Views" stroke="#ff782b" fill="url(#colorViews)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" fill="url(#colorClicks)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '16px' }} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Top Clicked Buttons Pie */}
                      <Card className="border-zinc-900 bg-[#0c0c0e] rounded-3xl p-5 text-left">
                        <CardHeader className="p-0 pb-4">
                          <CardTitle className="text-sm font-black text-zinc-200 uppercase tracking-widest">
                            🔥 Top Interaction Targets
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4 flex flex-col items-center">
                          {topButtons.length === 0 ? (
                            <div className="h-[200px] w-full flex items-center justify-center text-xs font-bold text-zinc-600 bg-zinc-900/20 rounded-2xl border border-zinc-900">
                              No interaction logs recorded
                            </div>
                          ) : (
                            <>
                              <div className="h-[180px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={topButtons}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={75}
                                      paddingAngle={3}
                                      dataKey="count"
                                      stroke="none"
                                      cornerRadius={5}
                                    >
                                      {topButtons.map((entry, index) => {
                                        const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#6366f1'];
                                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      })}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #1c1c21', borderRadius: '12px' }}
                                      itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>

                              <div className="w-full mt-4 space-y-2">
                                {topButtons.map((btn, idx) => {
                                  const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#6366f1'];
                                  return (
                                    <div key={idx} className="flex items-center justify-between text-xs font-bold text-zinc-400">
                                      <span className="flex items-center gap-2 truncate">
                                        <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        <span className="truncate max-w-[150px] capitalize">{btn.name}</span>
                                      </span>
                                      <span className="text-zinc-200 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                                        {btn.count}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Raw Event Logging */}
                    <Card className="border-zinc-900 bg-[#0c0c0e] rounded-3xl p-5 text-left">
                      <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-sm font-black text-zinc-200 uppercase tracking-widest">
                          🛡 Raw System Analytics Logs (Last 50)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 pt-2">
                        <div className="overflow-x-auto rounded-2xl border border-zinc-900">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-900/50 text-zinc-500 font-black uppercase text-[9px] tracking-wider border-b border-zinc-900">
                              <tr>
                                <th className="px-5 py-4">Event Type</th>
                                <th className="px-5 py-4">Button Identifier</th>
                                <th className="px-5 py-4">Associated profile</th>
                                <th className="px-5 py-4 text-right">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {filteredEvents.slice(0, 50).map(event => {
                                const profile = profiles.find(p => p.id === event.profile_id);
                                return (
                                  <tr key={event.id} className="hover:bg-zinc-900/10 transition-colors">
                                    <td className="px-5 py-3">
                                      <span className={`inline-flex px-2 py-0.5 rounded-md font-black uppercase text-[8px] tracking-wider ${event.event_type === 'view' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {event.event_type}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-zinc-400 capitalize">{event.button_name ?? '—'}</td>
                                    <td className="px-5 py-3 font-semibold text-zinc-300">{profile?.brand_name ?? 'N/A'}</td>
                                    <td className="px-5 py-3 text-right font-medium text-zinc-500">
                                      {new Date(event.created_at).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                              {filteredEvents.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="px-5 py-8 text-center text-zinc-600 font-extrabold text-xs">
                                    No logged events found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 5: HELP REQUESTS CRM (Support tickets panel) */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search queries by user name or text…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-zinc-900/50 border-zinc-900 focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-sm font-semibold"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="bg-[#0c0c0e] p-1.5 rounded-xl border border-zinc-900 flex gap-1 shadow-sm shrink-0">
                  {['all', 'pending', 'seen', 'resolved'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setEnquiryFilter(f as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${enquiryFilter === f
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets inbox */}
              <div className="grid gap-4">
                {filteredEnquiries.map(enquiry => (
                  <div
                    key={enquiry.id}
                    className={`rounded-3xl border p-6 text-left transition-all ${enquiry.status === 'pending'
                        ? 'border-orange-500/30 bg-orange-500/[0.02] shadow-sm'
                        : 'border-zinc-900 bg-[#0c0c0e] hover:border-zinc-800'
                      }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-black text-sm text-zinc-100">{enquiry.name}</h4>
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${enquiry.status === 'pending'
                              ? 'bg-orange-500/10 border-orange-500/20 text-orange-500 animate-pulse' :
                              enquiry.status === 'seen'
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                            {enquiry.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500 pt-1.5">
                          <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                            <Mail className="h-3.5 w-3.5" /> {enquiry.email}
                          </a>
                          {enquiry.phone && (
                            <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                              <Phone className="h-3.5 w-3.5" /> {enquiry.phone}
                            </a>
                          )}
                          <span>• {new Date(enquiry.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Ticket CRM toggles */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'seen')}
                          disabled={enquiry.status === 'seen' || enquiry.status === 'resolved'}
                          className="h-9 px-4 rounded-xl border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                        >
                          Mark Seen
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'resolved')}
                          disabled={enquiry.status === 'resolved'}
                          className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white border-0 shadow-sm disabled:opacity-50"
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-zinc-950 border border-zinc-900 p-5 text-sm leading-relaxed text-zinc-300 shadow-inner">
                      <p className="whitespace-pre-wrap">{enquiry.message}</p>
                    </div>
                  </div>
                ))}

                {filteredEnquiries.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-[#0c0c0e] py-16 text-center shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-600 border border-zinc-800/40">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-zinc-300 text-sm font-black uppercase tracking-wider">No help requests</h3>
                    <p className="text-xs font-semibold text-zinc-500 mt-1.5 leading-relaxed">
                      Enquiries matching your active filters will appear inside this inbox.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIPTIONS & PLANS MANAGEMENT */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-8 animate-fade-in text-left">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[
                  { label: 'Active Premium Plans', count: activePremiumCount, icon: Crown, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { label: 'Monthly Upgrades', count: monthlyCount, icon: Calendar, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                  { label: 'Yearly Upgrades', count: yearlyCount, icon: Star, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                  { label: 'Near Expiry (< 7d)', count: expiringSoonCount, icon: ShieldAlert, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                ].map((kpi, i) => (
                  <Card key={i} className="border-zinc-900 bg-[#0c0c0e] rounded-2xl hover:border-zinc-800 transition-all shadow-md">
                    <CardContent className="p-5 flex flex-col justify-between h-full text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{kpi.label}</span>
                        <div className={`p-2 rounded-xl border ${kpi.color}`}>
                          <kpi.icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-zinc-100 mt-6 tracking-tight">{kpi.count}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters Panel */}
              <div className="bg-[#0c0c0e] border border-zinc-900 rounded-3xl p-6 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      placeholder="Search by ID, email, name or slug…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-zinc-900/50 border-zinc-900 focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-sm font-semibold"
                    />
                  </div>
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    Found {filteredSubscriptions.length} registered accounts
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 border-t border-zinc-900/50 pt-4">
                  {/* Status filter */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Plan Status</span>
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 gap-1 shrink-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'active', label: 'Active Pro' },
                        { id: 'expiring', label: 'Expiring Soon' },
                        { id: 'expired', label: 'Expired' },
                        { id: 'lifetime', label: 'Lifetime' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSubStatusFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${subStatusFilter === f.id
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                              : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing cycle filter */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Billing Cycle</span>
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 gap-1 shrink-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'monthly', label: 'Monthly' },
                        { id: 'yearly', label: 'Yearly' },
                        { id: 'manual', label: 'Manual' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSubCycleFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${subCycleFilter === f.id
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                              : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tier filter */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tier</span>
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 gap-1 shrink-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'premium', label: 'Premium' },
                        { id: 'basic', label: 'Basic' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSubTierFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${subTierFilter === f.id
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                              : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriptions Directory Table */}
              <div className="overflow-hidden rounded-3xl border border-zinc-900 bg-[#0c0c0e] shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-zinc-900/50 text-zinc-500 font-black uppercase text-[10px] tracking-wider border-b border-zinc-900">
                      <tr>
                        <th className="px-6 py-4.5">Account / Profile</th>
                        <th className="px-6 py-4.5">Plan Level</th>
                        <th className="px-6 py-4.5">Billing Cycle</th>
                        <th className="px-6 py-4.5">Expiration Time</th>
                        <th className="px-6 py-4.5">Time Remaining</th>
                        <th className="px-6 py-4.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredSubscriptions.map(sub => (
                        <tr key={sub.userId} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {sub.profile?.logo_url ? (
                                <img src={sub.profile.logo_url} alt="" className="h-9 w-9 rounded-xl object-cover border border-zinc-800" />
                              ) : (
                                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-xs border border-orange-500/10 shrink-0">
                                  {sub.profile?.brand_name?.charAt(0) || sub.userId.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-xs font-black text-zinc-100 block leading-tight truncate">
                                  {sub.profile?.brand_name || 'Unpublished Profile'}
                                </span>
                                {sub.profile?.slug && (
                                  <span className="text-[10px] font-extrabold text-zinc-500 block mt-0.5 uppercase tracking-wider truncate">
                                    /{sub.profile?.slug}
                                  </span>
                                )}
                                {sub.profile?.email && (
                                  <span className="text-[9px] font-semibold text-zinc-500 block truncate">
                                    {sub.profile?.email}
                                  </span>
                                )}
                                <span className="font-mono text-[9px] text-zinc-600 block truncate mt-0.5" title="User ID">
                                  ID: {sub.userId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${sub.planTier === 'premium'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                                : 'bg-zinc-800 text-zinc-500'
                              }`}>
                              {sub.planTier}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {sub.planTier === 'premium' ? (
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                sub.billingCycle === 'monthly' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                sub.billingCycle === 'yearly' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                                'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              }`}>
                                {sub.billingCycle || 'manual'}
                              </span>
                            ) : (
                              <span className="text-zinc-600 font-semibold text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-zinc-400">
                            {sub.planTier === 'premium' ? (
                              sub.isLifetime ? (
                                <span className="text-amber-500 font-bold flex items-center gap-1"><Crown className="h-3.5 w-3.5 fill-amber-500/20" /> Lifetime</span>
                              ) : sub.expiresAt ? (
                                <span>{new Date(sub.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )
                            ) : (
                              <span className="text-zinc-600">No Expiration (Free)</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {sub.planTier === 'premium' ? (
                              sub.isLifetime ? (
                                <span className="text-xs font-bold text-amber-500">Active Forever</span>
                              ) : (
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  sub.status === 'expired' ? 'bg-rose-500/10 text-rose-500' :
                                  sub.status === 'expiring' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                                  'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                  {sub.timeString}
                                </span>
                              )
                            ) : (
                              <span className="text-zinc-600 text-xs font-semibold">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setManagePlanUser(sub.userId);
                                setManagePlanTier(sub.planTier);
                                setManagePlanCycle(sub.billingCycle || (sub.planTier === 'premium' ? 'manual' : 'none'));
                                setManagePlanExpiryOption(sub.isLifetime ? 'lifetime' : sub.expiresAt ? 'custom' : 'lifetime');
                                if (sub.expiresAt) {
                                  const dateObj = new Date(sub.expiresAt);
                                  const offset = dateObj.getTimezoneOffset();
                                  const localDate = new Date(dateObj.getTime() - offset * 60 * 1000);
                                  setManagePlanCustomExpiry(localDate.toISOString().slice(0, 16));
                                } else {
                                  setManagePlanCustomExpiry('');
                                }
                              }}
                              className="h-9 px-4 rounded-xl border-zinc-800 bg-zinc-900 text-xs font-black uppercase text-orange-500 hover:bg-zinc-800 hover:text-orange-400 transition-all shadow-sm"
                            >
                              Manage Plan
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredSubscriptions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-zinc-500 font-extrabold text-sm">
                            No subscription plans match your active filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: QR CODES MANAGEMENT */}
          {activeTab === 'qrcodes' && (
            <div className="space-y-6 animate-fade-in text-left">
              {/* QR Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total QR Codes', count: qrCodes.length, icon: QrCode, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                  { label: 'Assigned Codes', count: qrCodes.filter(q => q.status === 'assigned').length, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Available Stands', count: qrCodes.filter(q => q.status === 'available').length, icon: HelpCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
                ].map((kpi, idx) => (
                  <Card key={idx} className="bg-zinc-950 border-zinc-900 rounded-[2rem] p-6 relative overflow-hidden">
                    <CardContent className="p-0 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{kpi.label}</span>
                        <div className={`p-2 rounded-xl border ${kpi.color}`}>
                          <kpi.icon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      <p className="text-3xl font-black text-zinc-150 mt-6 tracking-tight">{kpi.count}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Bar & Table */}
              <div className="bg-[#0c0c0e]/80 border border-zinc-900 rounded-[2.5rem] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      placeholder="Search QR codes or brands..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-zinc-900/50 border-zinc-900 focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-sm font-semibold text-zinc-200"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={qrStatusFilter}
                      onChange={e => setQrStatusFilter(e.target.value as any)}
                      className="h-10 text-xs font-black bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-zinc-300 outline-none cursor-pointer focus:border-orange-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="assigned">Assigned</option>
                      <option value="available">Available</option>
                    </select>

                    <Button
                      onClick={() => {
                        const nextState = !isGeneratingQr;
                        setIsGeneratingQr(nextState);
                        if (nextState) {
                          setNewQrName('');
                          setNewQrType('none');
                          setNewQrProfileId('');
                          setNewQrCustomUrl('');
                          setNewQrProfileSearchQuery('');
                          resetQRStyle();
                        }
                      }}
                      className="flex items-center gap-2 h-10 px-5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/20"
                    >
                      <Plus className="h-4 w-4" /> Create Qr
                    </Button>
                  </div>
                </div>

                {/* QR Creator Expandable Panel */}
                {isGeneratingQr && (
                  <div className="relative p-6 rounded-[2.2rem] bg-zinc-950/60 border border-zinc-900 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {creatorLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 rounded-[2.2rem] backdrop-blur-[2px] space-y-3 animate-in fade-in duration-200">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Generating Qr Stand...</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-zinc-200 uppercase tracking-widest">
                        Create New Qr
                      </h3>
                      <span className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-orange-500 tracking-wider">
                        Interactive Setup
                      </span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left Side Settings */}
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Qr Code Name (optional)</label>
                          <Input
                            placeholder="e.g. Table 5 Stand, Lobby Entrance..."
                            value={newQrName}
                            onChange={e => setNewQrName(e.target.value)}
                            className="h-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Link Destination (Optional)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'none', label: 'Unassigned' },
                              { id: 'profile', label: 'Link Profile' },
                              { id: 'custom', label: 'Custom URL' },
                            ].map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setNewQrType(t.id as any)}
                                className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                  newQrType === t.id
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {newQrType === 'profile' && (
                          <div className="space-y-1.5 text-left animate-in fade-in duration-200">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Select Profile</label>
                            {newQrProfileId ? (
                              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 stroke-[3]" />
                                  <span className="text-xs font-black uppercase tracking-wider">
                                    Linked: {profiles.find(p => p.id === newQrProfileId)?.brand_name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewQrProfileId('');
                                    setNewQrProfileSearchQuery('');
                                  }}
                                  className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-250 transition-colors"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <>
                                <Input
                                  placeholder="Search profiles..."
                                  value={newQrProfileSearchQuery}
                                  onChange={e => setNewQrProfileSearchQuery(e.target.value)}
                                  className="h-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-bold mb-2"
                                />
                                <div className="max-h-[160px] overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900/40 p-2 space-y-1">
                                  {profiles
                                    .filter(p => p.brand_name.toLowerCase().includes(newQrProfileSearchQuery.toLowerCase()) || p.slug.toLowerCase().includes(newQrProfileSearchQuery.toLowerCase()))
                                    .map(p => {
                                      const isSelected = newQrProfileId === p.id;
                                      return (
                                        <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => setNewQrProfileId(p.id)}
                                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                                            isSelected ? 'bg-orange-500 text-white' : 'hover:bg-zinc-800 text-zinc-300'
                                          }`}
                                        >
                                          <span>{p.brand_name} <span className="text-[10px] opacity-75 font-mono ml-1">/{p.slug}</span></span>
                                          {isSelected && <Check className="h-3.5 w-3.5" />}
                                        </button>
                                      );
                                    })}
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {newQrType === 'custom' && (
                          <div className="space-y-1.5 text-left animate-in fade-in duration-200">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Redirect URL</label>
                            <Input
                              placeholder="https://example.com/custom-page"
                              value={newQrCustomUrl}
                              onChange={e => setNewQrCustomUrl(e.target.value)}
                              className="h-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-250 text-xs font-bold"
                            />
                          </div>
                        )}

                        {/* Style Options */}
                        <div className="border-t border-zinc-900/80 pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">QR Design Customization</span>
                            <span className="text-[9px] font-bold text-zinc-500 hover:text-orange-500 cursor-pointer transition-colors" onClick={resetQRStyle}>Reset Style</span>
                          </div>
                          
                          {/* Design Selection Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Choose a color */}
                            <div className="space-y-2 text-left">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Choose a color</label>
                              <div className="flex flex-wrap items-center gap-2">
                                {themeColors.map(tc => {
                                  const isSelected = qrColor === tc.value;
                                  return (
                                    <button
                                      key={tc.value}
                                      type="button"
                                      onClick={() => setQrColor(tc.value)}
                                      style={{ backgroundColor: tc.value }}
                                      className={`w-8 h-8 rounded-full relative border border-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center`}
                                      title={tc.name}
                                    >
                                      {isSelected && <Check className="h-4 w-4 text-white stroke-[3]" />}
                                    </button>
                                  );
                                })}
                                {/* Custom color wheel picker */}
                                <div className="w-8 h-8 rounded-full border border-zinc-800 bg-gradient-to-tr from-rose-500 via-emerald-500 to-blue-500 relative flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden" title="Custom color picker">
                                  <input
                                    type="color"
                                    value={qrColor}
                                    onChange={e => setQrColor(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                                  {!themeColors.some(tc => tc.value.toLowerCase() === qrColor.toLowerCase()) && (
                                    <Check className="h-4 w-4 text-white stroke-[3] drop-shadow-md z-10" />
                                  )}
                                </div>
                              </div>
                              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider ml-1">
                                Selected Hex: <span className="text-orange-500 font-bold">{qrColor}</span>
                              </div>
                            </div>

                            {/* Export Format Select */}
                            <div className="space-y-2 text-left">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Export Format</label>
                              <select
                                value={qrFileFormat}
                                onChange={e => setQrFileFormat(e.target.value as any)}
                                className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold focus:border-orange-500 focus:outline-none"
                              >
                                <option value="png">PNG Image (.png)</option>
                                <option value="svg">SVG Vector (.svg)</option>
                                <option value="jpeg">JPEG Image (.jpeg)</option>
                                <option value="webp">WebP Image (.webp)</option>
                              </select>
                              <div className="flex items-center gap-2 mt-2 ml-1">
                                <input
                                  id="qr-transparent-checkbox"
                                  type="checkbox"
                                  checked={qrTransparent}
                                  onChange={e => setQrTransparent(e.target.checked)}
                                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-orange-500 cursor-pointer accent-orange-500"
                                />
                                <label
                                  htmlFor="qr-transparent-checkbox"
                                  className="text-[10px] font-black text-zinc-400 uppercase tracking-wider cursor-pointer select-none"
                                >
                                  Transparent Background
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Choose a style section */}
                          <div className="space-y-3 pt-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Choose a style</label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              {/* Dots style */}
                              <div className="space-y-2 text-left">
                                <span className="text-[10px] font-bold text-zinc-400 block ml-0.5">Dots</span>
                                <div className="flex flex-wrap gap-2">
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
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                          isSelected
                                            ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                      >
                                        {getDotsTypeIcon(opt.id)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Marker border */}
                              <div className="space-y-2 text-left">
                                <span className="text-[10px] font-bold text-zinc-400 block ml-0.5">Marker border</span>
                                <div className="flex flex-wrap gap-2">
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
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                          isSelected
                                            ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                      >
                                        {getCornersSquareIcon(opt.id)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Marker center */}
                              <div className="space-y-2 text-left">
                                <span className="text-[10px] font-bold text-zinc-400 block ml-0.5">Marker center</span>
                                <div className="flex flex-wrap gap-2">
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
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                          isSelected
                                            ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
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
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateQRCode}
                            className="h-10 rounded-xl bg-orange-500 text-white hover:bg-orange-600 text-xs font-black uppercase tracking-wider px-6 shadow-md shadow-orange-500/20"
                          >
                            Create Qr
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsGeneratingQr(false);
                              resetQRStyle();
                            }}
                            className="h-10 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider px-4"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>

                      {/* Right Side Live Preview */}
                      <div className="w-full lg:w-[280px] shrink-0 flex flex-col items-center justify-start space-y-4">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest self-start ml-1 block">Interactive Preview</span>
                        <div className="w-full flex flex-col items-center justify-center p-5 bg-zinc-900/20 border border-zinc-900/50 rounded-[2rem] space-y-4">
                          <QRCodeLivePreview
                            code={getNextStandCode()}
                            color={qrColor}
                            dotsType={qrDotsType}
                            cornersSquareType={qrCornersSquareType}
                            cornersDotType={qrCornersDotType}
                            transparent={qrTransparent}
                          />
                          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950/80 border border-zinc-900 rounded-lg text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                            <Eye className="h-3 w-3 text-zinc-500" />
                            Default Style Preview
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code list table */}
                <div className="overflow-x-auto border-t border-zinc-900">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/40">
                        <th className="px-6 py-4.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name / Label</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">QR Code ID</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Redirect URL</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Design Style</th>
                        <th className="px-6 py-4.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40">
                      {filteredQrCodes.map((q) => (
                        <tr key={q.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-zinc-200 block truncate max-w-[150px]">
                              {q.name || <span className="text-zinc-600 font-normal">Unlabeled Stand</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-black text-xs text-orange-500">
                            {q.code}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                              q.status === 'assigned'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {q.status === 'assigned' ? (
                              <div className="flex flex-col space-y-0.5">
                                {q.custom_url ? (
                                  <a
                                    href={q.custom_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-zinc-300 hover:text-orange-500 flex items-center gap-1 transition-all"
                                  >
                                    <span className="truncate max-w-[180px]">{q.custom_url}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                ) : (
                                  <Link
                                    to={`/p/${q.profiles?.slug}`}
                                    target="_blank"
                                    className="text-xs font-bold text-zinc-300 hover:text-orange-500 flex items-center gap-1 transition-all"
                                  >
                                    <span>/{q.profiles?.slug}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-600 font-semibold italic">No destination set</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 block"
                                style={{ backgroundColor: q.style?.color || '#f97316' }}
                              />
                              <span className="text-[10px] font-mono text-zinc-400 font-semibold capitalize">
                                {q.style?.dotsType || 'rounded'} / {q.style?.cornersSquareType || 'extra-rounded'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAssigningQr(q);
                                  setCustomLinkUrl(q.custom_url || '');
                                }}
                                className="h-8 px-2.5 rounded-lg border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-[10px] font-black uppercase text-zinc-300 hover:text-white"
                              >
                                Link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCustomizingQr(q);
                                  setQrColor(q.style?.color || '#f97316');
                                  setQrDotsType(q.style?.dotsType || 'rounded');
                                  setQrCornersSquareType(q.style?.cornersSquareType || 'extra-rounded');
                                  setQrCornersDotType(q.style?.cornersDotType || 'dot');
                                  setQrFileFormat(q.style?.fileFormat || 'png');
                                  setQrTransparent(q.style?.transparent || false);
                                }}
                                className="h-8 px-2.5 rounded-lg border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-[10px] font-black uppercase text-orange-500 hover:text-orange-400"
                              >
                                Style
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadQR(q.code)}
                                className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteQrCode(q.id)}
                                className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-900/50 hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 border-zinc-900 hover:border-rose-900/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredQrCodes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-zinc-500 font-extrabold text-sm">
                            No QR Codes match your active filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MANAGE PLAN MODAL OVERLAY */}
      {managePlanUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-500" /> Manage Account Plan
              </h3>
              <button 
                onClick={() => setManagePlanUser(null)}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-black uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {/* User context info */}
              <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Account (User ID)</p>
                <p className="font-mono text-xs font-bold text-zinc-300 truncate mt-1">{managePlanUser}</p>
                {(() => {
                  const profile = profiles.find(p => p.user_id === managePlanUser);
                  if (profile) {
                    return (
                      <div className="mt-2 text-xs font-semibold text-orange-500">
                        Profile: <strong className="text-zinc-300">/{profile.slug}</strong> ({profile.brand_name})
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Plan Tier Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Plan Tier</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'basic', label: 'Basic (Free)' },
                    { id: 'premium', label: 'Premium (Pro)' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setManagePlanTier(t.id as any);
                        if (t.id === 'basic') {
                          setManagePlanCycle('none');
                        } else if (managePlanCycle === 'none') {
                          setManagePlanCycle('manual');
                        }
                      }}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        managePlanTier === t.id
                          ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Cycle Selection */}
              {managePlanTier === 'premium' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Billing Cycle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'yearly', label: 'Yearly' },
                      { id: 'manual', label: 'Manual' },
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setManagePlanCycle(c.id as any)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          managePlanCycle === c.id
                            ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiration Settings */}
              {managePlanTier === 'premium' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Subscription Expiration</label>
                  <select
                    value={managePlanExpiryOption}
                    onChange={(e) => setManagePlanExpiryOption(e.target.value as any)}
                    className="w-full text-xs font-black bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 cursor-pointer focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="lifetime">Lifetime (No Expiry)</option>
                    <option value="30days">+30 Days (1 Month)</option>
                    <option value="365days">+365 Days (1 Year)</option>
                    <option value="custom">Custom Date & Time</option>
                  </select>

                  {managePlanExpiryOption === 'custom' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Choose Date & Time</span>
                      <input
                        type="datetime-local"
                        value={managePlanCustomExpiry}
                        onChange={(e) => setManagePlanCustomExpiry(e.target.value)}
                        className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Save/Cancel actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1 h-11 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-xs font-bold uppercase tracking-wider"
                  onClick={() => setManagePlanUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  type="button"
                  className="flex-1 h-11 rounded-xl bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20"
                  onClick={async () => {
                    let expiryDate: string | null = null;
                    if (managePlanTier === 'premium') {
                      if (managePlanExpiryOption === '30days') {
                        const d = new Date();
                        d.setDate(d.getDate() + 30);
                        expiryDate = d.toISOString();
                      } else if (managePlanExpiryOption === '365days') {
                        const d = new Date();
                        d.setDate(d.getDate() + 365);
                        expiryDate = d.toISOString();
                      } else if (managePlanExpiryOption === 'custom') {
                        if (!managePlanCustomExpiry) {
                          toast.error("Please select a custom expiration date.");
                          return;
                        }
                        expiryDate = new Date(managePlanCustomExpiry).toISOString();
                      }
                    }
                    
                    const cycle = managePlanTier === 'basic' ? null : (managePlanCycle === 'none' ? 'manual' : managePlanCycle);

                    await handleUpdatePlan(managePlanUser, managePlanTier, cycle, expiryDate);
                    setManagePlanUser(null);
                  }}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN PROFILE / LINK MODAL OVERLAY */}
      {assigningQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
            {linkLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 rounded-[2rem] backdrop-blur-[2px] space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Linking Destination...</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-zinc-150 uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-500" /> Link QR Destination
              </h3>
              <button 
                onClick={() => {
                  setAssigningQr(null);
                  setProfileSearchQuery('');
                  setCustomLinkUrl('');
                }}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-black uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {/* QR Stand info */}
              <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-900">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active QR Stand</p>
                <p className="font-mono text-sm font-black text-orange-500 mt-1">{assigningQr.code}</p>
                {assigningQr.name && (
                  <p className="text-xs text-zinc-400 mt-1">Label: {assigningQr.name}</p>
                )}
              </div>

              {/* Destination Type Select tabs */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Destination Target</label>
                
                <div className="space-y-4">
                  {/* Option 1: Profile link */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 block ml-1">Option A: Link Portid Profile</span>
                    <Input
                      placeholder="Search profile brand or slug..."
                      value={profileSearchQuery}
                      onChange={e => setProfileSearchQuery(e.target.value)}
                      className="h-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-bold"
                    />
                    <div className="max-h-[140px] overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900/40 p-2 space-y-1">
                      {profiles
                        .filter(p => p.brand_name.toLowerCase().includes(profileSearchQuery.toLowerCase()) || p.slug.toLowerCase().includes(profileSearchQuery.toLowerCase()))
                        .map(p => {
                          const isSelected = assigningQr.assigned_profile_id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleUpdateQRLink(assigningQr.id, p.id, null)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                                isSelected ? 'bg-orange-500 text-white' : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              <span>{p.brand_name} <span className="text-[10px] opacity-75 font-mono ml-1">/{p.slug}</span></span>
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                            </button>
                          );
                        })}
                      {profiles.length === 0 && (
                        <p className="text-center text-[10px] text-zinc-500 py-4 font-semibold uppercase">No profiles found</p>
                      )}
                    </div>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-900"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-zinc-900"></div>
                  </div>

                  {/* Option 2: Custom URL link */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 block ml-1">Option B: Link External Web URL</span>
                    <Input
                      placeholder="e.g. https://mybusiness.com"
                      value={customLinkUrl}
                      onChange={e => setCustomLinkUrl(e.target.value)}
                      className="h-10 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-bold"
                    />
                    <Button
                      onClick={() => {
                        if (!customLinkUrl.trim()) {
                          toast.error("Please enter a valid URL.");
                          return;
                        }
                        handleUpdateQRLink(assigningQr.id, null, customLinkUrl.trim());
                      }}
                      className="w-full h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-850 text-xs font-black uppercase tracking-wider animate-pulse hover:animate-none"
                    >
                      Save External URL
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reset to unassigned action */}
              {(assigningQr.assigned_profile_id || assigningQr.custom_url) && (
                <div className="pt-4 border-t border-zinc-900">
                  <Button
                    onClick={() => handleUpdateQRLink(assigningQr.id, null, null)}
                    className="w-full h-10 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-500 hover:bg-rose-950/40 text-xs font-black uppercase tracking-wider"
                  >
                    Unlink Destination (Make Available)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZE QR CODE MODAL OVERLAY */}
      {customizingQr && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-zinc-100">
            <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 sm:p-8 w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto">
              
              {/* Left Column: Style Selectors & Settings */}
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-6 text-left">
                  {/* Header */}
                  <div>
                    <h2 className="text-xl font-black text-zinc-150 tracking-tight">Customize QR Design</h2>
                    <p className="text-xs text-zinc-400 font-semibold mt-1">Configure colors, patterns, corner markers, and formats.</p>
                  </div>

                  {/* Destination Info */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-1">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Destination URL</span>
                    <span className="text-xs font-mono text-zinc-400 block truncate">
                      {customizingQr.status === 'assigned'
                        ? (customizingQr.custom_url || `${window.location.origin}/p/${customizingQr.profiles?.slug || ''}`)
                        : 'Unassigned (shows Stand Not Activated yet)'}
                    </span>
                  </div>

                  {/* Design Selection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Choose a color */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Choose a color</label>
                      <div className="flex flex-wrap items-center gap-2">
                        {themeColors.map(tc => {
                          const isSelected = qrColor === tc.value;
                          return (
                            <button
                              key={tc.value}
                              type="button"
                              onClick={() => setQrColor(tc.value)}
                              style={{ backgroundColor: tc.value }}
                              className={`w-8 h-8 rounded-full relative border border-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center`}
                              title={tc.name}
                            >
                              {isSelected && <Check className="h-4 w-4 text-white stroke-[3]" />}
                            </button>
                          );
                        })}
                        {/* Custom color wheel picker */}
                        <div className="w-8 h-8 rounded-full border border-zinc-800 bg-gradient-to-tr from-rose-500 via-emerald-500 to-blue-500 relative flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden" title="Custom color picker">
                          <input
                            type="color"
                            value={qrColor}
                            onChange={e => setQrColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {!themeColors.some(tc => tc.value.toLowerCase() === qrColor.toLowerCase()) && (
                            <Check className="h-4 w-4 text-white stroke-[3] drop-shadow-md z-10" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider ml-1">
                        Selected Hex: <span className="text-orange-500 font-bold">{qrColor}</span>
                      </div>
                    </div>

                    {/* Export Format Select */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Export Format</label>
                      <select
                        value={qrFileFormat}
                        onChange={e => setQrFileFormat(e.target.value as any)}
                        className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold focus:border-orange-500 focus:outline-none"
                      >
                        <option value="png">PNG Image (.png)</option>
                        <option value="svg">SVG Vector (.svg)</option>
                        <option value="jpeg">JPEG Image (.jpeg)</option>
                        <option value="webp">WebP Image (.webp)</option>
                      </select>
                      <div className="flex items-center gap-2 mt-2 ml-1">
                        <input
                          id="qr-transparent-checkbox-modal"
                          type="checkbox"
                          checked={qrTransparent}
                          onChange={e => setQrTransparent(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-orange-500 cursor-pointer accent-orange-500"
                        />
                        <label
                          htmlFor="qr-transparent-checkbox-modal"
                          className="text-[10px] font-black text-zinc-400 uppercase tracking-wider cursor-pointer select-none"
                        >
                          Transparent Background
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Choose a style section */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Choose a style</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* Dots style */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-bold text-zinc-400 block ml-0.5">Dots</span>
                        <div className="flex flex-wrap gap-2">
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
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                {getDotsTypeIcon(opt.id)}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Marker border */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-bold text-zinc-400 block ml-0.5">Marker border</span>
                        <div className="flex flex-wrap gap-2">
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
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                {getCornersSquareIcon(opt.id)}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Marker center */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-bold text-zinc-400 block ml-0.5">Marker center</span>
                        <div className="flex flex-wrap gap-2">
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
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                  isSelected
                                    ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
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
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 pt-6 border-t border-zinc-900">
                  <Button
                    variant="outline"
                    type="button"
                    className="flex-1 h-11 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-xs font-bold uppercase tracking-wider"
                    onClick={() => {
                      setCustomizingQr(null);
                      resetQRStyle();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    type="button"
                    className="flex-1 h-11 rounded-xl bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20"
                    onClick={async () => {
                      const newStyle: QRCodeStyle = {
                        color: qrColor,
                        dotsType: qrDotsType,
                        cornersSquareType: qrCornersSquareType,
                        cornersDotType: qrCornersDotType,
                        fileFormat: qrFileFormat,
                        transparent: qrTransparent
                      };
                      await handleSaveQRStyle(customizingQr.id, newStyle);
                    }}
                  >
                    Save Style
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Preview Container */}
              <div className="w-full md:w-[320px] shrink-0 flex flex-col items-center justify-center space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center self-start">
                  Real-Time Vector Preview
                </h3>
                <div className="w-full flex-1 flex flex-col items-center justify-center p-6 bg-zinc-900/20 border border-zinc-900/50 rounded-[2rem] space-y-4 min-h-[340px]">
                  <QRCodeLivePreview
                    code={customizingQr.code}
                    color={qrColor}
                    dotsType={qrDotsType}
                    cornersSquareType={qrCornersSquareType}
                    cornersDotType={qrCornersDotType}
                    transparent={qrTransparent}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    <Eye className="h-3.5 w-3.5 text-zinc-500" />
                    Scan live preview to test
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono text-center">
                  Ref Stand: <span className="text-orange-500 font-bold">{customizingQr.code}</span>
                </p>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default AdminDashboard;
