import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Smartphone, Zap, BarChart3, Users, QrCode, Globe, CheckCircle2,
  ChevronRight, Laptop, Nfc, Star, ArrowRight, X, UserCircle2, Briefcase, Coffee, Plus, Minus, Play, Menu,
  MonitorSmartphone, Tag, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const HERO_PROFILES = [
  {
    name: "Alex Designer",
    role: "Product Designer & Developer",
    bgGradient: "from-amber-100 to-orange-200",
    btnGradient: "from-amber-500 to-orange-500",
    btnShadow: "shadow-orange-500/20"
  },
  {
    name: "Sarah Jenkins",
    role: "Real Estate Agent",
    bgGradient: "from-emerald-100 to-teal-200",
    btnGradient: "from-emerald-500 to-teal-500",
    btnShadow: "shadow-emerald-500/20"
  },
  {
    name: "David Chen",
    role: "Creative Director",
    bgGradient: "from-blue-100 to-indigo-200",
    btnGradient: "from-blue-500 to-indigo-500",
    btnShadow: "shadow-blue-500/20"
  }
];

const Landing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentProfile, setCurrentProfile] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yPremiumCard = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yQrCode = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yReviewStand = useTransform(scrollYProgress, [0, 1], [0, -80]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProfile((prev) => (prev + 1) % HERO_PROFILES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden font-body">
      {/* 1. Navbar */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none">
        <nav className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl sm:rounded-full px-4 sm:px-8 h-16 flex items-center justify-between pointer-events-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/portid-logo.png?v=2" alt="Portid" className="h-[50px] w-auto object-contain scale-[2.2] origin-left -ml-2 group-hover:scale-[2.3] transition-transform" />
          </Link>

          <div className="hidden lg:flex items-center bg-zinc-50/50 rounded-full px-8 py-2 border border-zinc-100 gap-8 font-medium text-sm text-zinc-600">
            <a href="#" className="hover:text-orange-500 text-zinc-900 font-semibold hover:text-orange-500 transition-colors">Home</a>
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#products" className="hover:text-orange-500 transition-colors">Products</a>
            <a href="#pricing" className="hover:text-orange-500 transition-colors">Pricing</a>
            <Link to="/qr-code-generator" className="hover:text-orange-500 transition-colors flex items-center gap-1.5">
              QR Generator
              <span className="bg-orange-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none tracking-wide animate-pulse">
                New
              </span>
            </Link>
            <a href="#about" className="hover:text-orange-500 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 hidden lg:block px-3">
              Log In
            </Link>
            <Link to="/create-profile">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-orange-500/25 border-0 hover:opacity-90 transition-all rounded-full px-4 sm:px-6 h-9 sm:h-10 text-sm">
                Get Started
              </Button>
            </Link>
            <button className="lg:hidden p-1.5 text-zinc-600 hover:text-zinc-900 ml-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-20 inset-x-4 sm:inset-x-6 p-5 bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-2xl pointer-events-auto lg:hidden flex flex-col gap-5 z-50"
            >
              <div className="flex flex-col gap-4">
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-zinc-900 px-2 text-lg">Home</a>
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 hover:text-zinc-900 px-2 text-lg transition-colors">Features</a>
                <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 hover:text-zinc-900 px-2 text-lg transition-colors">Products</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 hover:text-zinc-900 px-2 text-lg transition-colors">Pricing</a>
                <Link to="/qr-code-generator" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 hover:text-zinc-900 px-2 text-lg transition-colors flex items-center gap-2">
                  QR Generator
                  <span className="bg-orange-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full leading-none tracking-wide">
                    New
                  </span>
                </Link>
                <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 hover:text-zinc-900 px-2 text-lg transition-colors">About</a>
              </div>
              <hr className="border-zinc-100" />
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl h-12 text-base font-semibold text-zinc-800">Log In</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Hero Section */}
      <section ref={heroRef} className="relative pt-28 pb-20 lg:pt-40 lg:pb-24 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/50 via-white to-white -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial="hidden" animate="visible" variants={fadeIn}
              className="max-w-2xl lg:self-start lg:mt-8 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-zinc-500 animate-pulse"></span>
                The Future of Networking
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-zinc-900">
                Turn Every Interaction Into a <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Customer</span>.
              </h1>
              <p className="text-lg text-zinc-600 mb-8 max-w-xl leading-relaxed">
                Build a powerful digital identity for your business. Share everything about your brand in one click—from contact details to products—while capturing leads and creating a future-ready presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/create-profile">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/20 rounded-full h-12 px-8 text-base font-semibold hover:opacity-90 hover:scale-[1.02] transition-all border-0">
                    Create Free Profile
                  </Button>
                </Link>
                <Button onClick={() => setShowDemoModal(true)} size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 text-base font-semibold border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-all">
                  View Interactive Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto lg:ml-auto w-full max-w-[340px] perspective-1000 lg:-mt-12"
            >
              {/* Product Mockup (Stylized Phone) */}
              <div className="relative rounded-[2.5rem] bg-white border-[8px] border-zinc-900 shadow-2xl overflow-hidden aspect-[9/16] flex flex-col">
                <div className="absolute top-0 inset-x-0 h-5 bg-zinc-900 rounded-b-xl max-w-[100px] mx-auto z-20"></div>

                {/* Simulated UI inside phone animating through profiles */}
                <div className="flex-1 bg-zinc-50 overflow-hidden relative flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProfile}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute inset-0 flex flex-col"
                    >
                      {/* Banner */}
                      <div className={`h-24 bg-gradient-to-br ${HERO_PROFILES[currentProfile].bgGradient} relative`}>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-16 bg-white rounded-full p-1 shadow-md">
                          <div className="h-full w-full bg-zinc-200 rounded-full flex items-center justify-center overflow-hidden">
                            <UserCircle2 className="h-10 w-10 text-zinc-400" />
                          </div>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="pt-10 px-4 flex flex-col items-center flex-1 pb-4">
                        <h3 className="font-bold text-base text-zinc-900">{HERO_PROFILES[currentProfile].name}</h3>
                        <p className="text-[10px] text-zinc-500 mb-3">{HERO_PROFILES[currentProfile].role}</p>

                        <div className="w-full space-y-2">
                          <div className={`h-9 w-full bg-gradient-to-r ${HERO_PROFILES[currentProfile].btnGradient} rounded-xl shadow-sm ${HERO_PROFILES[currentProfile].btnShadow} flex items-center justify-center text-white text-xs font-medium gap-2`}>
                            <Star className="h-3 w-3" /> Save Contact
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
                              <Globe className="h-3 w-3 text-zinc-600" />
                            </div>
                            <div className="h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
                              <BarChart3 className="h-3 w-3 text-zinc-600" />
                            </div>
                            <div className="h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
                              <Users className="h-3 w-3 text-zinc-600" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 w-full rounded-xl bg-white border border-zinc-100 p-3 shadow-sm flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-semibold text-zinc-900">Latest Updates</h4>
                            <ChevronRight className="h-3 w-3 text-zinc-400" />
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="h-12 bg-zinc-50 rounded border border-zinc-100"></div>
                            <div className="h-12 bg-zinc-50 rounded border border-zinc-100"></div>
                          </div>
                          <div className="h-8 w-full bg-zinc-50 rounded flex items-center px-2 border border-zinc-100 gap-2">
                            <div className="h-4 w-4 rounded-full bg-zinc-200"></div>
                            <div className="h-2 w-16 rounded-full bg-zinc-200"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating Elements mimicking interactivity */}
              <motion.div
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -right-2 top-24 lg:-right-6 lg:top-16 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-100 scale-75 lg:scale-100 origin-right z-30"
              >
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-orange-600">
                  <Nfc className="h-5 w-5" />
                </div>
                <div className="pr-2">
                  <p className="text-xs font-bold">NFC Ready</p>
                  <p className="text-[10px] text-zinc-500">Tap to share</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -left-4 bottom-32 lg:-left-8 lg:bottom-20 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-100 scale-75 lg:scale-100 origin-left z-20"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="pr-2">
                  <p className="text-xs font-bold">+240 Views</p>
                  <p className="text-[10px] text-zinc-500">This week</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-6 top-1/2 -translate-y-1/2 lg:-left-12 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-100 z-20 scale-75 lg:scale-100 origin-left"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="pr-2 text-left">
                  <p className="text-xs font-bold">Lead Captured</p>
                  <p className="text-[10px] text-zinc-500">Just now</p>
                </div>
              </motion.div>

              {/* ----- Parallax Elements added per request ----- */}

              {/* Premium Luxury Card attached to Scroll */}
              <motion.div
                style={{ y: yPremiumCard }}
                className="absolute -right-4 bottom-10 lg:-right-24 lg:bottom-24 w-56 h-32 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-zinc-700 p-4 transform rotate-12 flex flex-col justify-between z-30 scale-50 sm:scale-75 lg:scale-100 origin-bottom-right"
              >
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.05)_40%,transparent_60%)] rounded-xl pointer-events-none"></div>
                <div className="flex justify-between items-center w-full relative z-10">
                  <Nfc className="h-6 w-6 text-amber-500" />
                  <div className="bg-zinc-700/50 rounded-full px-3 py-1 text-[9px] font-bold text-amber-400 tracking-wider uppercase border border-white/5">Portid Black</div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1 w-1 rounded-full bg-amber-500"></span>
                    <p className="text-white font-bold text-sm tracking-wide">VIP ACCESS</p>
                  </div>
                  <div className="h-1 w-12 bg-zinc-700 rounded-full"></div>
                </div>
              </motion.div>

              {/* QR Code Element attached to Scroll */}
              <motion.div
                style={{ y: yQrCode }}
                className="absolute -left-6 top-12 lg:-left-20 lg:top-20 w-28 h-28 bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_20px_35px_-5px_rgba(0,0,0,0.1)] border border-white p-3 transform -rotate-12 block z-30 scale-75 lg:scale-100 origin-top-left"
              >
                <div className="w-full h-full bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col items-center justify-center p-2">
                  <QrCode className="w-full h-full text-zinc-800 drop-shadow-sm mb-1" />
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest text-center">Scan Me</span>
                </div>
              </motion.div>

              {/* Review Stand Element attached to Scroll */}
              <motion.div
                style={{ y: yReviewStand }}
                className="absolute -right-4 top-0 xl:-right-12 xl:top-8 w-32 pb-4 bg-gradient-to-b from-white to-zinc-50 rounded-2xl shadow-[0_25px_40px_-10px_rgba(0,0,0,0.15)] border-t border-x border-zinc-200 border-b-4 border-b-zinc-300 p-3 transform rotate-6 flex flex-col items-center justify-between z-30 scale-50 xl:scale-100 origin-top-right"
              >
                {/* Stand glint effect */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-white to-transparent rounded-t-2xl opacity-80 pointer-events-none"></div>

                <div className="text-center mt-1 space-y-1">
                  <div className="flex justify-center -space-x-1 mb-1 relative">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 drop-shadow-sm z-10" />
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 drop-shadow-sm translate-y-1 opacity-70" />
                  </div>
                  <p className="text-[10px] font-extrabold text-zinc-900 tracking-tight leading-tight uppercase relative z-20">Rate Us On<br />Google</p>
                </div>

                <div className="flex flex-col items-center w-full gap-2 mt-3 relative z-10">
                  <div className="bg-white p-1 rounded-lg border border-zinc-100 shadow-sm">
                    <QrCode className="h-10 w-10 text-zinc-800" />
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1.5 rounded-full w-[110%] justify-center border border-blue-100 shadow-sm relative -bottom-2">
                    <Nfc className="h-3 w-3 text-blue-600" />
                    <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest drop-shadow-sm">Tap Here</span>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-16 lg:py-20 bg-zinc-50 border-t border-zinc-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Platform Features
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">
              Everything You Need to <br /><span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Scale Your Network</span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">Stop wasting money on paper cards. Upgrade to a modern solution engineered for professional networking and growth.</p>
          </div>

          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                title: "Digital Identity", desc: "Create a beautiful, personalized mobile landing page.", icon: Smartphone,
                bgClass: "bg-gradient-to-br from-[#f8fafc] to-blue-50/80", borderClass: "border-blue-100/80 hover:border-blue-300",
                iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25",
                shadowClass: "hover:shadow-[0_15px_35px_rgba(59,130,246,0.15)]"
              },
              {
                title: "NFC Sharing", desc: "Share your entire footprint with a single tap.", icon: Nfc,
                bgClass: "bg-gradient-to-br from-[#fdfaef] to-orange-50/80", borderClass: "border-zinc-200/80 hover:border-orange-400",
                iconBg: "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25",
                shadowClass: "hover:shadow-[0_15px_35px_rgba(249,115,22,0.15)]"
              },
              {
                title: "Lead Capture", desc: "Built-in contact forms to gather warm leads on the spot.", icon: Users,
                bgClass: "bg-gradient-to-br from-[#f5fdf9] to-emerald-50/80", borderClass: "border-emerald-100/80 hover:border-emerald-300",
                iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25",
                shadowClass: "hover:shadow-[0_15px_35px_rgba(16,185,129,0.15)]"
              },
              {
                title: "Live Analytics", desc: "Track profile views, unique visitors, and link clicks securely.", icon: BarChart3,
                bgClass: "bg-gradient-to-br from-[#fcfaff] to-purple-50/80", borderClass: "border-purple-100/80 hover:border-purple-300",
                iconBg: "bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white shadow-lg shadow-purple-500/25",
                shadowClass: "hover:shadow-[0_15px_35px_rgba(168,85,247,0.15)]"
              },
              {
                title: "Custom Themes", desc: "Switch color palettes to match your brand identity instantly.", icon: Globe,
                bgClass: "bg-gradient-to-br from-[#fffafa] to-rose-50/80", borderClass: "border-rose-100/80 hover:border-rose-300",
                iconBg: "bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25",
                shadowClass: "hover:shadow-[0_15px_35px_rgba(244,63,94,0.15)]"
              },
              {
                title: "Dynamic Products", desc: "Showcase menus, portfolios, and services directly on your card.", icon: Briefcase,
                bgClass: "bg-gradient-to-br from-[#fffdf5] to-amber-50/80", borderClass: "border-amber-200/80 hover:border-amber-400",
                iconBg: "bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-lg shadow-amber-500/25",
                shadowClass: "hover:shadow-[0_15px_35px_rgba(245,158,11,0.15)]"
              },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeIn} className={`${f.bgClass} p-8 py-10 rounded-[2rem] shadow-sm border ${f.borderClass} ${f.shadowClass} hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm z-10`}>
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 block z-[-1]" />
                <div className={`h-16 w-16 rounded-2xl ${f.iconBg} flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-[1.15] group-hover:rotate-3 relative z-10`}>
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-2xl text-zinc-900 mb-3 relative z-10 tracking-tight">{f.title}</h3>
                <p className="text-zinc-600 leading-relaxed text-[15px] relative z-10">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="about" className="py-16 lg:py-20 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12 flex flex-col items-center">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">
              How <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Portid</span> Works
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">It's completely frictionless. A simple tap magically loads your personalized digital profile onto their phone in seconds—no app required.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-zinc-100"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Create Profile', desc: 'Create a profile with your brand identity and theme', icon: UserCircle2 },
                { step: 2, title: 'Get Product', desc: 'Get your NFC or QR based product', icon: Nfc },
                { step: 3, title: 'Phone Detects', desc: 'Instantly detects on any smartphone', icon: Smartphone },
                { step: 4, title: 'Profile Opens', desc: 'Full brand visibility with contact and lead options', icon: Globe },
              ].map((s, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-white border-4 border-zinc-50 shadow-lg flex items-center justify-center mb-6 relative group hover:border-orange-100 transition-colors">
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {s.step}
                    </div>
                    <s.icon className="h-10 w-10 text-orange-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-bold text-lg text-zinc-900 mb-2">{s.title}</h4>
                  <p className="text-sm text-zinc-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Products Section */}
      <section id="products" className="py-16 lg:py-20 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Our Lineup
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">
              Premium Hardware & <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Tools</span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">Choose the perfect touchpoint for your brand. From stylish NFC hardware to powerful digital integration tools.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "NFC Profile Stands",
                desc: "Elegant desk and counter stands with built-in NFC. Available in various brand color themes.",
                mockup: (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center pt-4">
                    <div className="relative flex flex-col items-center group-hover:-translate-y-2 transition-transform duration-500">
                      {/* Acrylic Stand Body */}
                      <div className="w-24 h-36 bg-red-700 rounded-t-xl shadow-[0_10px_20px_rgba(185,28,28,0.3)] border-t border-x border-red-500/50 flex flex-col items-center pt-4 px-2 z-10 mb-[-8px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                        <div className="text-[7px] font-black tracking-widest text-white mb-0.5 relative z-10">YOUR LOGO</div>
                        <div className="text-[4.5px] font-semibold tracking-widest text-red-200 mb-3 relative z-10 text-center leading-tight">SCAN<br />& CONNECT</div>
                        <div className="w-16 h-16 bg-white rounded-lg p-1 mx-auto mt-auto mb-4 shadow-inner flex items-center justify-center relative z-10">
                          <QrCode className="h-full w-full text-zinc-900" />
                        </div>
                      </div>
                      {/* Base Station */}
                      <div className="w-36 h-8 bg-zinc-50 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border-y border-zinc-200 border-x border-x-zinc-100 z-20 flex flex-col items-center justify-start relative overflow-hidden">
                        <div className="w-full h-2 bg-white mb-1"></div>
                        <div className="flex items-center gap-1 opacity-50">
                          <Nfc className="h-3 w-3 text-zinc-600" />
                          <span className="text-[5px] font-bold text-zinc-600">TAP TO CONNECT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                title: "Digital QR Codes",
                desc: "Custom-generated QR codes perfectly matched to your brand's unique color palette.",
                mockup: (
                  <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                    <div className="w-28 h-28 bg-white p-3 rounded-3xl shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 rotate-6 hover:rotate-0">
                      <div className="w-full h-full border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center bg-zinc-50/50">
                        <QrCode className="h-12 w-12 text-orange-500" />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                title: "Smart Stickers",
                desc: "Durable QR & NFC stickers. Perfect for windows, displays, laptops, or equipment.",
                mockup: (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-24 h-24 bg-white rounded-full shadow-lg border border-emerald-100 flex items-center justify-center -rotate-12 group-hover:-translate-y-2 transition-transform duration-500 z-10">
                      <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                        <Nfc className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white flex items-center justify-center rotate-12 ml-16 mt-12 group-hover:translate-x-2 transition-transform duration-500">
                      <QrCode className="h-8 w-8 text-teal-600/50" />
                    </div>
                  </div>
                )
              },
              {
                title: "Tags & Keychains",
                desc: "Portable NFC tags and keychains. High-quality build, easy to carry and tap on the go.",
                mockup: (
                  <div className="w-full h-full bg-gradient-to-br from-purple-50 to-fuchsia-100 flex items-center justify-center">
                    <div className="relative flex flex-col items-center group-hover:rotate-12 transition-transform duration-500 origin-[50%_10%]">
                      <div className="w-6 h-6 border-[3px] border-zinc-300 rounded-full mb-[-4px] z-10 shadow-sm relative"></div>
                      <div className="w-1.5 h-3 bg-zinc-400 z-0 border border-zinc-300"></div>
                      <div className="w-16 h-20 bg-zinc-900 rounded-[1rem] shadow-xl border border-zinc-700 flex items-center justify-center mt-[-2px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.1)_40%,transparent_60%)] pointer-events-none"></div>
                        <Nfc className="h-6 w-6 text-fuchsia-400" />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                title: "Premium Smart Cards",
                desc: "High-end visiting cards embedded with NFC technology and QR. Built to impress.",
                mockup: (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center perspective-1000">
                    <div className="w-44 h-28 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] border border-zinc-700 p-4 flex flex-col justify-between -rotate-[10deg] group-hover:rotate-0 transition-transform duration-500 hover:scale-[1.02]">
                      <div className="flex justify-between items-center w-full">
                        <Nfc className="h-5 w-5 text-amber-500" />
                        <div className="bg-zinc-700/50 rounded-full px-2 py-0.5 text-[8px] font-bold text-amber-400 tracking-widest uppercase">Portid</div>
                      </div>
                      <div>
                        <div className="h-1.5 w-16 bg-zinc-500/50 rounded-full mb-2"></div>
                        <div className="h-1 w-10 bg-zinc-600/50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                title: "Profile Built Tools",
                desc: "Powerful profile building software suite to design, track, and manage your digital identity.",
                mockup: (
                  <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center pt-8">
                    <div className="w-48 h-36 bg-white rounded-t-xl shadow-2xl border-t border-x border-zinc-200 flex flex-col overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                      <div className="h-5 bg-zinc-100 border-b border-zinc-200 flex items-center gap-1.5 px-3">
                        <div className="w-2 h-2 rounded-full bg-rose-400"></div><div className="w-2 h-2 rounded-full bg-amber-400"></div><div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      </div>
                      <div className="p-2.5 flex gap-2.5 h-full">
                        <div className="w-1/3 h-full bg-zinc-50/80 rounded border border-zinc-100"></div>
                        <div className="w-2/3 flex flex-col gap-2.5">
                          <div className="w-full h-8 bg-zinc-50/80 rounded border border-zinc-100 flex items-center px-2">
                            <div className="h-2 w-12 bg-zinc-200 rounded-full"></div>
                          </div>
                          <div className="w-full flex-1 bg-zinc-50/80 rounded border border-zinc-100 relative overflow-hidden flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-rose-300/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            ].map((p, i) => (
              <motion.div key={i} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1 }} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-xl hover:border-zinc-100 transition-all duration-300 group flex flex-col overflow-hidden text-left">
                <div className="h-56 w-full relative overflow-hidden bg-zinc-50 border-b border-zinc-100">
                  {p.mockup}
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl text-zinc-900 mb-3">{p.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo QR Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-md relative"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-zinc-100/50 rounded-full text-white hover:bg-zinc-100 hover:text-zinc-900 transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 pt-10 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[length:64px_64px] opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)' }}></div>
                <h3 className="text-2xl font-bold font-heading mb-2 relative z-10 tracking-tight">Scan to Experience</h3>
                <p className="text-orange-100 text-sm relative z-10 leading-relaxed font-medium">Point your phone's camera at the QR code below to see the magic instantly.</p>
              </div>

              <div className="p-8 flex flex-col items-center justify-center bg-zinc-50 relative">
                {/* Simulated Scanning QR Box */}
                <div className="relative w-56 h-56 bg-white p-4 rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border border-zinc-100">
                  {/* Scanning Line Animation */}
                  <motion.div
                    animate={{ y: ["0%", "800%", "0%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-[3px] bg-zinc-500 shadow-[0_0_20px_rgba(249,115,22,1)] z-20"
                  />
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-full h-full p-2 pointer-events-none z-10 flex flex-col justify-between">
                    <div className="flex justify-between w-full h-8">
                      <div className="border-t-4 border-l-4 border-orange-500 rounded-tl-xl w-8 h-8"></div>
                      <div className="border-t-4 border-r-4 border-orange-500 rounded-tr-xl w-8 h-8"></div>
                    </div>
                    <div className="flex justify-between w-full h-8">
                      <div className="border-b-4 border-l-4 border-orange-500 rounded-bl-xl w-8 h-8"></div>
                      <div className="border-b-4 border-r-4 border-orange-500 rounded-br-xl w-8 h-8"></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center p-6 z-10 bg-white">
                    <QRCodeSVG value={window.location.origin + "/demo"} size={160} />
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-4 w-full px-4">
                  <div className="h-[1px] flex-1 bg-zinc-200"></div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Or Open on device</span>
                  <div className="h-[1px] flex-1 bg-zinc-200"></div>
                </div>

                <Button asChild className="w-full mt-6 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-14 text-base font-bold shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5">
                  <Link to="/demo">
                    View Demo Profile <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Demo Section */}
      <section className="py-16 lg:py-20 bg-zinc-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-900"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">Experience Portid in Action</h2>
              <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                Watch how seamlessly a tap converts into a saved contact and a new lead. It is frictionless, instant, and leaves a memorable impression.
              </p>
              <ul className="space-y-4 mb-10">
                {['No App Required to view profiles', 'Works on all modern smartphones', 'Instant VCF Contact Card download', 'Auto-capture client details via Lead Form'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => setShowDemoModal(true)} size="lg" className="bg-white text-zinc-900 hover:bg-orange-50 hover:text-orange-600 rounded-full h-12 px-8 font-bold border border-zinc-100 hover:border-orange-200">
                Try Interactive Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} onClick={() => setShowDemoModal(true)} className="relative mx-auto w-full max-w-md aspect-video bg-zinc-800 rounded-3xl border border-zinc-700 shadow-2xl overflow-hidden flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600069226367-4ebec1c07b49?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="h-20 w-20 bg-zinc-500/90 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 z-10 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-white fill-current ml-1" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 7. Pricing Section */}
      <section id="pricing" className="py-24 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Choose Your Plan</h2>
            <p className="text-zinc-500 text-lg">Start free. Upgrade as you grow.</p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-zinc-900 font-bold' : 'text-zinc-500'}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 rounded-full bg-zinc-100 border border-zinc-200 p-1 flex items-center transition-colors hover:border-orange-200"
              >
                <div className={`w-4 h-4 rounded-full bg-orange-500 transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-zinc-900 font-bold' : 'text-zinc-500'}`}>
                Yearly <span className="text-emerald-500 font-bold ml-1">(-33%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* FREE PLAN */}
            <div className="bg-zinc-50/50 p-8 rounded-[2.5rem] border border-zinc-100 flex flex-col hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-900">₹0</span>
                  <span className="text-zinc-500 text-sm">/forever</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  '1 Profile',
                  '4 Links',
                  'Limited Themes',
                  'Standard QR Code'
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-600">
                    <CheckCircle2 className="h-4 w-4 text-zinc-300 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full rounded-2xl h-12 text-zinc-800 border-zinc-200 hover:bg-zinc-50 font-bold">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* STANDARD PLAN */}
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-500 shadow-2xl shadow-orange-500/10 flex flex-col relative scale-[1.02] z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 py-1.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-900">
                    {billingCycle === 'monthly' ? '₹249' : '₹199'}
                  </span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                {billingCycle === 'yearly' && <p className="text-emerald-500 text-xs font-bold mt-1">₹1,999 billed annually</p>}
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Up to 3 Profiles',
                  'Unlimited Links',
                  'Media Uploads',
                  'QR Code Generation',
                  'Basic Product Listing'
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-800 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white rounded-2xl h-12 font-bold shadow-lg shadow-orange-500/20 border-0">
                  Upgrade to Standard
                </Button>
              </Link>
            </div>

            {/* PREMIUM PLAN */}
            <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col text-white hover:shadow-2xl transition-all duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'monthly' ? '₹599' : '₹416'}
                  </span>
                  <span className="text-zinc-400 text-sm">/month</span>
                </div>
                {billingCycle === 'yearly' && <p className="text-amber-400 text-xs font-bold mt-1">₹4,999 billed annually</p>}
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Unlimited Profiles',
                  'Custom Themes',
                  'Remove Watermark',
                  'Lead Generation Forms',
                  'Email Notifications'
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-zinc-700 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full bg-zinc-800 text-white hover:bg-zinc-700 rounded-2xl h-12 font-bold border-0">
                  Go Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7.5 Take It Offline Section */}
      <section id="hardware" className="py-24 bg-zinc-50 border-t border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Real-World Interaction
            </div>
            <h2 className="font-heading text-4xl font-bold text-zinc-900 mb-4 tracking-tight">Take It Offline</h2>
            <p className="text-zinc-500 text-lg">Turn your profile into a tap-and-share experience with NFC and QR products.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Basic Kit",
                price: "₹799",
                desc: "NFC Card + Digital QR Code. Free plan forever. Best for individuals, creators, and small shops.",
                icon: CreditCard,
                iconBg: "bg-orange-50",
                iconColor: "text-orange-600"
              },
              {
                title: "Standard Brand Kit",
                price: "₹1,699",
                desc: "NFC QR Stand + NFC Brand Card + 12 months Standard Plan. A complete brand setup.",
                icon: MonitorSmartphone,
                iconBg: "bg-amber-50",
                iconColor: "text-amber-600"
              },
              {
                title: "Professional Brand Kit",
                price: "₹2,699",
                desc: "Custom NFC QR Stand + NFC Brand Card + 12 months Premium Plan. Maximum impact and leads.",
                icon: Briefcase,
                iconBg: "bg-zinc-100",
                iconColor: "text-zinc-600"
              }
            ].map((product, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-zinc-200 hover:border-orange-200 hover:shadow-xl transition-all group flex flex-col">
                <div className={`h-14 w-14 rounded-2xl ${product.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <product.icon className={`h-7 w-7 ${product.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-1">{product.title}</h3>
                <div className="text-2xl font-black text-orange-600 mb-4">{product.price}</div>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6 flex-1">{product.desc}</p>
                <Button variant="outline" className="w-full rounded-xl border-zinc-200 text-zinc-600 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
                  Get This Kit
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-zinc-900 text-white rounded-full h-14 px-10 text-lg font-bold shadow-xl hover:bg-zinc-800 transition-all border-0">
              Explore Smart Products
            </Button>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-16 lg:py-20 bg-zinc-50 border-t border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
            <h2 className="font-heading text-3xl font-bold text-zinc-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "Do the people I share my card with need an app?", a: "No! Your profile opens securely in their default web browser instantly." },
              { q: "What devices are compatible?", a: "Nearly all modern smartphones (iPhone XS and newer, and almost all Androids) have built-in NFC and can tap to read." },
              { q: "Can I update my info later?", a: "Yes, you can update your contact information, links, and themes at any time from your dashboard." },
              { q: "How does the Lead Capture work?", a: "Premium users can turn on a built-in form. When someone visits your profile, they can leave their email/phone, which is sent instantly to your inbox." }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-zinc-900"
                >
                  {faq.q}
                  {openFaq === i ? <Minus className="h-5 w-5 text-orange-500" /> : <Plus className="h-5 w-5 text-zinc-400" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <p className="px-6 pb-6 text-zinc-600 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-16 lg:py-20 relative overflow-hidden bg-zinc-900 text-white border-y border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-900 z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6">Ready to Build Your Digital Identity?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg">
            Join thousands of professionals upgrading their networking game today. No credit card required.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full h-14 px-10 text-lg font-bold shadow-2xl shadow-orange-500/40 hover:scale-105 transition-transform border-0">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-zinc-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-heading text-xl font-bold tracking-tight text-zinc-900">
              Portid
            </Link>
            <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
              Empowering professionals to build powerful digital identities and meaningful connections.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li><Link to="#" className="hover:text-orange-500 transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-orange-500 transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-orange-500 transition-colors">NFC Tags</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li><Link to="#" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-orange-500 transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-200 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Portid. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
