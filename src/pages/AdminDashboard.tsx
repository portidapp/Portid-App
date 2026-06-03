import { useEffect, useState } from 'react';
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
  FileSpreadsheet, Check, ShieldAlert, Settings, Layout, Download
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'profiles' | 'analytics' | 'enquiries'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'pending' | 'seen' | 'resolved'>('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profilesRes, usersRes, plansRes, analyticsRes, enquiriesRes] = await Promise.all([
        supabase.from('profiles').select('id, brand_name, slug, category, theme, layout, logo_url, user_id, created_at, is_premium').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*').order('user_id'),
        supabase.from('user_plans').select('user_id, plan_tier'),
        supabase.from('analytics').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('support_enquiries').select('*').order('created_at', { ascending: false }),
      ]);

      setProfiles(profilesRes.data ?? []);
      setUsers(usersRes.data ?? []);
      setUserPlans(plansRes.data as UserPlan[] ?? []);
      setAnalytics(analyticsRes.data ?? []);
      setEnquiries(enquiriesRes.data ?? []);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Failed to load administration data.");
    } finally {
      setLoading(false);
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

  const handleUpdatePlan = async (userId: string, newTier: 'basic' | 'premium') => {
    const { error } = await supabase
      .from('user_plans')
      .upsert({ user_id: userId, plan_tier: newTier }, { onConflict: 'user_id' });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`User plan updated to ${newTier.toUpperCase()}`);
    setUserPlans(prev => {
      const exists = prev.some(p => p.user_id === userId);
      if (exists) {
        return prev.map(p => p.user_id === userId ? { ...p, plan_tier: newTier } : p);
      } else {
        return [...prev, { user_id: userId, plan_tier: newTier }];
      }
    });
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

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
            { id: 'profiles', label: 'Profiles DB', icon: User },
            { id: 'analytics', label: 'Analytics Engine', icon: BarChart3 },
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
              <option value="profiles">Profiles DB</option>
              <option value="analytics">Analytics Engine</option>
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

        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
