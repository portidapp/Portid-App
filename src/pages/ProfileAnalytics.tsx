import { PremiumLoader } from '@/components/PremiumLoader';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  ArrowLeft, Download, FileSpreadsheet, Crown, Calendar, Users, MousePointerClick
} from 'lucide-react';
import { toast } from 'sonner';
import { parseCustomTheme, getThemeColors } from '@/lib/themes';

interface AnalyticsEvent {
  event_type: string;
  button_name: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  requirement: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  brand_name: string;
  slug: string;
  theme?: string;
}

interface ProfileAnalyticsProps {
  embedded?: boolean;
  profileId?: string | null;
}

const ProfileAnalytics = ({ embedded = false, profileId: passedId }: ProfileAnalyticsProps = {}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = passedId || paramId;
  const { user, planTier, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      // 1. Fetch Profile
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('id, brand_name, slug, theme')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (pError || !profileData) {
        toast.error('Profile not found');
        navigate('/dashboard');
        return;
      }
      setProfile(profileData);

      // 2. Fetch Analytics
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('event_type, button_name, created_at')
        .eq('profile_id', id)
        .order('created_at', { ascending: true });
      
      setEvents(analyticsData ?? []);

      // 3. Fetch Leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('profile_id', id)
        .order('created_at', { ascending: false });
      
      setLeads(leadsData ?? []);
      setLoading(false);
    };

    if (!authLoading) {
      fetchData();
    }
  }, [id, user, navigate, authLoading]);

  // Process data for charts
  const getProcessedData = () => {
    const dayMap: Record<string, { date: string; views: number; clicks: number }> = {};
    const daysCount = timeRange === '7days' ? 7 : 30;
    
    const rangeDays = Array.from({ length: daysCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    rangeDays.forEach(date => {
      dayMap[date] = { date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), views: 0, clicks: 0 };
    });

    events.forEach(e => {
      const date = e.created_at.split('T')[0];
      if (dayMap[date]) {
        if (e.event_type === 'view') dayMap[date].views++;
        else if (e.event_type === 'button_click') dayMap[date].clicks++;
      }
    });

    return Object.values(dayMap);
  };

  const getButtonData = () => {
    const btnMap: Record<string, number> = {};
    events.filter(e => {
      if (e.event_type !== 'button_click' || !e.button_name) return false;
      const name = e.button_name.toLowerCase();
      if (name.startsWith('lead_open_') || name.startsWith('lead_submit_') || name === 'primary action') return false;
      return true;
    }).forEach(e => {
      btnMap[e.button_name!] = (btnMap[e.button_name!] || 0) + 1;
    });

    return Object.entries(btnMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
  };

  const exportToCSV = (type: 'analytics' | 'leads') => {
    let csvContent = "";
    let fileName = "";

    if (type === 'analytics') {
      csvContent = "Event Type,Button Name,Timestamp\n" + 
        events.map(e => `${e.event_type},${e.button_name || 'N/A'},${e.created_at}`).join("\n");
      fileName = `${profile?.brand_name}_analytics.csv`;
    } else {
      csvContent = "Name,Email,Phone,Requirement,Timestamp\n" + 
        leads.map(l => `${l.name},${l.email || ''},${l.phone || ''},"${l.requirement?.replace(/"/g, '""') || ''}",${l.created_at}`).join("\n");
      fileName = `${profile?.brand_name}_leads.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = getProcessedData();
  const buttonData = getButtonData();
  const totalViews = events.filter(e => e.event_type === 'view').length;
  const totalClicks = events.filter(e => e.event_type === 'button_click').length;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  const themeData = profile?.theme || 'minimal';
  const themeColors = (themeData.startsWith('custom:') ? parseCustomTheme(themeData) : null) || getThemeColors(themeData);

  const dividerStyle = {
    borderColor: themeColors.btnText === '#ffffff' || themeColors.btnText === '#fafafa' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
  };

  if (loading || authLoading) {
    return <PremiumLoader fullScreen={!embedded} />;
  }

  return (
    <div className={embedded ? "w-full pb-12" : "min-h-screen bg-ethereal"}>
      {/* Header - Only show if not embedded */}
      {!embedded && (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-white/40">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="rounded-full p-2 hover:bg-zinc-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-zinc-600" />
              </Link>
              <div>
                <h1 className="text-lg font-black leading-none">{profile?.brand_name}</h1>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Analytics Dashboard</p>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={embedded ? "w-full" : "container mx-auto px-4 py-8 max-w-7xl"}>
        
        <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <TabsList className="bg-white/60 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-white/60 w-max">
                <TabsTrigger value="overview" className="rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-soft font-bold text-[13px] transition-all">Overview</TabsTrigger>
                <TabsTrigger value="leads" className="rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-soft font-bold text-[13px] transition-all flex items-center gap-2">
                  Leads ({leads.length})
                  {planTier !== 'premium' && <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />}
                </TabsTrigger>
             </TabsList>
             <Button variant="outline" onClick={() => exportToCSV('analytics')} className="gap-2 rounded-full border-white/80 bg-white/60 backdrop-blur hover:bg-white shadow-sm font-bold text-[13px] text-zinc-600 hover:text-orange-600 transition-all">
                <Download className="h-4 w-4" /> Export Report
             </Button>
          </div>

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">
               
               {/* Left Column (Hero + Trending Actions) */}
               <div className="flex-1 space-y-6 sm:space-y-8 min-w-0">
                  
                  {/* Hero Banner (Matches Reference top-left blue card, but styled in the brand's primary colors) */}
                  <div 
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.btnBg} 0%, ${themeColors.btnBg}dd 60%, ${themeColors.btnBg}bb 100%)`,
                      boxShadow: themeColors.btnBg.startsWith('#') && themeColors.btnBg.length === 7 
                        ? `0 20px 40px ${themeColors.btnBg}25` 
                        : '0 20px 40px rgba(0, 0, 0, 0.05)',
                      color: themeColors.btnText
                    }}
                    className="rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[340px]"
                  >
                     {/* Decorative abstract shapes (simulating the paint splashes in the reference, but cleaner SaaS style) */}
                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                     
                     <div className="relative z-10">
                        <p style={{ opacity: 0.8 }} className="text-[11px] font-bold tracking-widest mb-2 uppercase">Performance Overview</p>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 leading-tight">{profile?.brand_name || 'Your Profile'}</h2>
                        <p style={{ opacity: 0.85 }} className="font-medium max-w-md text-sm sm:text-base leading-relaxed">
                          Track how your audience is engaging with your NFC tags and profile links in real-time. Keep optimizing to increase conversions.
                        </p>
                     </div>

                     <div 
                       style={{ 
                         backgroundColor: themeColors.btnText === '#ffffff' || themeColors.btnText === '#fafafa' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                         borderColor: themeColors.btnText === '#ffffff' || themeColors.btnText === '#fafafa' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
                       }}
                       className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 backdrop-blur-md rounded-2xl p-5 sm:p-6 border w-max shadow-sm"
                     >
                        <div style={dividerStyle} className="pr-4 sm:pr-8 sm:border-r">
                           <p style={{ opacity: 0.75 }} className="text-[11px] uppercase tracking-widest font-bold mb-1">Total Views</p>
                           <p className="text-3xl sm:text-4xl font-black">{totalViews.toLocaleString()}</p>
                        </div>
                        <div style={dividerStyle} className="pr-4 sm:pr-8 sm:border-r">
                           <p style={{ opacity: 0.75 }} className="text-[11px] uppercase tracking-widest font-bold mb-1">Total Clicks</p>
                           <p className="text-3xl sm:text-4xl font-black">{totalClicks.toLocaleString()}</p>
                        </div>
                        <div style={dividerStyle} className="pr-4 sm:pr-8 sm:border-r">
                           <p style={{ opacity: 0.75 }} className="text-[11px] uppercase tracking-widest font-bold mb-1">Click Rate</p>
                           <p className="text-3xl sm:text-4xl font-black">{ctr}%</p>
                        </div>
                        <div>
                           <p style={{ opacity: 0.75 }} className="text-[11px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
                             Total Leads {planTier !== 'premium' && <Crown className="h-3 w-3 fill-current opacity-80" />}
                           </p>
                           <p className="text-3xl sm:text-4xl font-black">{planTier === 'premium' ? leads.length : '—'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Activity Area Chart (Moved from right column and enhanced) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-lg font-black text-zinc-900">
                         Traffic Activity
                      </h3>
                      
                      {/* Time Range Selector Tabs */}
                      <div className="bg-zinc-100/80 p-1 rounded-xl flex gap-1 border border-zinc-200/50 shadow-sm">
                        <button
                          onClick={() => setTimeRange('7days')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-tight transition-all uppercase ${
                            timeRange === '7days' 
                              ? 'bg-white text-orange-600 shadow-sm scale-[1.02]' 
                              : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          7 Days
                        </button>
                        <button
                          onClick={() => setTimeRange('30days')}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-tight transition-all uppercase ${
                            timeRange === '30days' 
                              ? 'bg-white text-orange-600 shadow-sm scale-[1.02]' 
                              : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          Month
                        </button>
                      </div>
                    </div>
                    <Card className="border-none shadow-soft bg-white/80 backdrop-blur-md rounded-3xl p-2 sm:p-4 transition-all hover:bg-white">
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="h-[280px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                              <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 600, fill: '#71717a' }}
                                minTickGap={30}
                              />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#71717a' }} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: '1px solid #e4e4e7', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', padding: '12px 16px' }}
                                itemStyle={{ fontSize: '14px', fontWeight: 800 }}
                                labelStyle={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                              />
                              <Area type="monotone" dataKey="views" name="Views" stroke="#6366f1" fill="url(#colorViews)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366f1' }} />
                              <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#f97316" fill="url(#colorClicks)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#f97316' }} />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 700, color: '#3f3f46', paddingTop: '16px' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
               </div>

               {/* Right Column (Statistics matching reference side panel) */}
               <div className="w-full xl:w-[340px] shrink-0 space-y-6 sm:space-y-8">
                  
                  {/* Doughnut Chart Card */}
                  <Card className="border-none shadow-soft bg-white rounded-3xl flex flex-col min-h-[400px] p-2">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-base font-black text-zinc-900 flex justify-between items-center">
                         Statistics
                         <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1.5 rounded-lg">Last 30 days</span>
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center pt-6">
                       <div className="h-[220px] w-full relative">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={[
                                 { name: 'Views', value: totalViews || 1, color: '#6366f1' },
                                 { name: 'Clicks', value: totalClicks, color: '#f97316' },
                               ]}
                               cx="50%"
                               cy="50%"
                               innerRadius={70}
                               outerRadius={95}
                               paddingAngle={4}
                               dataKey="value"
                               stroke="none"
                               cornerRadius={6}
                             >
                               <Cell key="cell-0" fill="#6366f1" />
                               <Cell key="cell-1" fill="#f97316" />
                             </Pie>
                             <Tooltip 
                               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '10px 14px' }}
                               itemStyle={{ fontSize: '14px', fontWeight: 800 }}
                             />
                           </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rate</p>
                            <p className="text-2xl font-black text-zinc-900">{ctr}%</p>
                         </div>
                       </div>
                       
                       <div className="w-full mt-8 space-y-3 px-4">
                         <div className="flex items-center justify-between text-sm bg-indigo-50/50 rounded-xl px-4 py-3">
                           <div className="flex items-center gap-3 font-bold text-indigo-900">
                             <div className="h-3.5 w-3.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div> Views
                           </div>
                           <span className="font-black text-indigo-900">{totalViews}</span>
                         </div>
                         <div className="flex items-center justify-between text-sm bg-orange-50/50 rounded-xl px-4 py-3">
                           <div className="flex items-center gap-3 font-bold text-orange-900">
                             <div className="h-3.5 w-3.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div> Clicks
                           </div>
                           <span className="font-black text-orange-900">{totalClicks}</span>
                         </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Top Links Pie Chart */}
                  <Card className="border-none shadow-soft bg-white rounded-3xl flex flex-col p-2">
                    <CardHeader className="pb-0">
                       <CardTitle className="text-[13px] font-bold text-zinc-500 flex items-center justify-between">
                         <span className="flex items-center gap-1.5"><MousePointerClick className="h-4 w-4 text-orange-500" /> Link Distribution</span>
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center pt-6">
                       {buttonData.length === 0 ? (
                         <div className="h-[180px] w-full flex items-center justify-center text-xs font-bold text-zinc-400 bg-zinc-50/50 rounded-2xl">
                            No click data yet
                         </div>
                       ) : (
                         <>
                           <div className="h-[180px] w-full relative">
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie
                                   data={buttonData}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={50}
                                   outerRadius={80}
                                   paddingAngle={2}
                                   dataKey="value"
                                   stroke="none"
                                   cornerRadius={4}
                                 >
                                   {buttonData.map((entry, index) => {
                                     const COLORS = ['#14b8a6', '#8b5cf6', '#f43f5e', '#f97316', '#6366f1'];
                                     return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   })}
                                 </Pie>
                                 <Tooltip 
                                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '10px 14px' }}
                                   itemStyle={{ fontSize: '13px', fontWeight: 800 }}
                                 />
                               </PieChart>
                             </ResponsiveContainer>
                           </div>
                           
                           <div className="w-full mt-4 space-y-2 px-2 pb-2">
                             {buttonData.map((link, idx) => {
                               const COLORS = ['#14b8a6', '#8b5cf6', '#f43f5e', '#f97316', '#6366f1'];
                               return (
                                 <div key={idx} className="flex items-center justify-between text-xs">
                                   <div className="flex items-center gap-2 font-bold text-zinc-600 truncate">
                                     <div className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div> 
                                     <span className="truncate max-w-[150px]" title={link.name}>{link.name}</span>
                                   </div>
                                   <span className="font-black text-zinc-900 bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">{link.value}</span>
                                 </div>
                               );
                             })}
                           </div>
                         </>
                       )}
                    </CardContent>
                  </Card>

               </div>

            </div>
          </TabsContent>

          <TabsContent value="leads">
            {planTier === 'premium' ? (
              <Card className="border-none shadow-soft bg-white overflow-hidden rounded-3xl">
                 <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 bg-zinc-50/50 p-6">
                    <CardTitle className="text-base font-black text-zinc-900">Collected Enquiries</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV('leads')} className="text-xs h-9 gap-2 px-4 rounded-full border-zinc-200 font-bold hover:bg-zinc-100">
                      <FileSpreadsheet className="h-4 w-4" /> Download
                    </Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-zinc-50/50 text-zinc-400 font-bold uppercase text-[11px] tracking-wider">
                          <tr>
                            <th className="px-8 py-5 border-b border-zinc-100">Contact</th>
                            <th className="px-8 py-5 border-b border-zinc-100">Requirement / Message</th>
                            <th className="px-8 py-5 border-b border-zinc-100 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {leads.map(lead => (
                            <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors group">
                              <td className="px-8 py-5">
                                <p className="font-black text-zinc-900">{lead.name}</p>
                                <div className="flex flex-col gap-0.5 mt-1.5 text-xs font-medium text-zinc-500">
                                  {lead.phone && <span className="flex items-center gap-1.5">{lead.phone}</span>}
                                  {lead.email && <span className="flex items-center gap-1.5">{lead.email}</span>}
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-sm font-medium text-zinc-600 leading-relaxed max-w-md line-clamp-3">
                                  "{lead.requirement || 'No message provided'}"
                                </p>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <p className="text-xs font-bold text-zinc-500">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-[11px] font-medium text-zinc-400 mt-1">
                                  {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                            </tr>
                          ))}
                          {leads.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-8 py-24 text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-zinc-50 mb-4">
                                  <Users className="h-8 w-8 text-zinc-300" />
                                </div>
                                <p className="text-sm font-bold text-zinc-900">No enquiries collected yet</p>
                                <p className="text-xs font-medium text-zinc-500 mt-1">When users contact you through your profile, they will appear here.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-soft bg-white p-12 text-center rounded-3xl">
                <div className="mx-auto bg-amber-100 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <Crown className="h-10 w-10 fill-current" />
                </div>
                <h3 className="text-2xl font-black mb-3">Unlock Lead Insights</h3>
                <p className="text-zinc-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                  Lead collection and detailed enquiry management are exclusive to Premium users. Upgrade your account to start capturing potential customers today.
                </p>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-10 py-6 rounded-full text-base shadow-[0_10px_25px_rgba(249,115,22,0.3)] hover:scale-105 transition-transform"
                >
                  Upgrade to Premium
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfileAnalytics;
