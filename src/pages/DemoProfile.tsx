import { useState, useEffect } from 'react';
import { Phone, MessageCircle, Globe, MapPin, Instagram, Facebook, Star, UserPlus, Share2, MessageSquare, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
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
import { motion } from 'framer-motion';

const DemoProfile = () => {
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hardcoded premium data
  const profile = {
    brand_name: "Alex Studio",
    tagline: "Award-winning Digital Designer & Developer",
    category: "Design Agency",
    description: "I help visionary companies build incredible digital products. With over 10 years of experience in UI/UX and frontend engineering, I bridge the gap between design and technology.",
    phone: "+1 234 567 890",
    whatsapp: "1234567890",
    instagram: "https://instagram.com",
    website: "https://alexdesigner.com",
    address: "123 Creative Avenue, Design District, NY 10001",
    logo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    cover_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  };

  const products = [
    { id: 1, title: "Brand Identity Design", description: "Complete brand guidelines, logo, and visual language.", image_url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=400" },
    { id: 2, title: "UI/UX App Design", description: "User-centric mobile app design.", image_url: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=400" },
  ];

  const submitLead = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    setTimeout(() => {
      toast.success('Awesome! Your enquiry was sent (Simulated)');
      setLeadFormOpen(false);
      setSubmittingLead(false);
    }, 1000);
  };

  const downloadVCard = () => {
    toast.success('vCard download initiated! (Simulated)');
  };

  const handleShare = () => {
    toast.success('Profile link copied to clipboard!');
  };

  const actionButtons = [
    { label: 'Call', icon: Phone, href: `tel:${profile.phone}` },
    { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/${profile.whatsapp}` },
    { label: 'Instagram', icon: Instagram, href: profile.instagram },
    { label: 'Website', icon: Globe, href: profile.website },
  ];

  return (
    <>
      <title>{profile.brand_name} | Interactive Demo</title>
      
      {/* Return to website floating banner */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/">
          <Button variant="secondary" className="rounded-full shadow-lg border border-zinc-200 bg-white/90 backdrop-blur-md hover:bg-white text-zinc-900 font-semibold h-10 px-5 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Exit Demo
          </Button>
        </Link>
      </div>

      <div className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-orange-500 selection:text-white pb-32 font-body font-medium">
        <div className="relative">
          <div className="h-80 w-full overflow-hidden">
            <img src={profile.cover_image_url} alt="" className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <div className="flex items-end gap-5 max-w-md mx-auto">
              <img src={profile.logo_url} alt={profile.brand_name} className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-xl bg-white" />
              <div className="pb-2">
                <h1 className="font-heading text-4xl font-black leading-none text-zinc-900 tracking-tight">{profile.brand_name}</h1>
                <p className="text-sm font-semibold text-orange-500 mt-2">{profile.tagline}</p>
                <span className="mt-3 inline-block rounded-full bg-white border border-zinc-200 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm">{profile.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-md px-6 pt-6">
          <div className="grid grid-cols-4 gap-3">
            {actionButtons.map(b => (
              <a key={b.label} href="#" onClick={(e) => { e.preventDefault(); toast(`Opened ${b.label} link`); }}
                className="flex flex-col items-center justify-center gap-2 h-[88px] rounded-[1.25rem] transition-all active:scale-95 bg-white border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-orange-200 group"
              >
                <b.icon className="h-7 w-7 text-zinc-600 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-orange-600 uppercase tracking-wider transition-colors">{b.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={downloadVCard} className="flex-1 flex items-center justify-center gap-2 h-14 rounded-[1.25rem] text-sm font-bold transition-all bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95 shadow-md">
              <UserPlus className="h-4 w-4" /> Save Contact
            </button>
            <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 h-14 rounded-[1.25rem] text-sm font-bold transition-all bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 active:scale-95 shadow-sm">
              <Share2 className="h-4 w-4" /> Share Profile
            </button>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="space-y-6 text-zinc-600">
               <div className="flex items-start gap-4">
                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                   <MapPin className="h-5 w-5" />
                 </div>
                 <div className="flex-1 pt-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Office</p>
                   <p className="text-sm font-semibold leading-relaxed text-zinc-800">{profile.address}</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                   <Globe className="h-5 w-5" />
                 </div>
                 <div className="flex-1 pt-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Website</p>
                   <p className="text-sm font-semibold leading-relaxed text-orange-500">{profile.website.replace(/^https?:\/\//, '')}</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="mb-6 font-heading text-lg font-bold text-zinc-400 tracking-widest uppercase flex items-center gap-4">
               <div className="h-[1px] flex-1 bg-zinc-200"></div>
               Featured Work
               <div className="h-[1px] flex-1 bg-zinc-200"></div>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {products.map(item => (
                <div key={item.id} className="group overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-orange-200 hover:shadow-orange-500/10 cursor-pointer">
                  <div className="aspect-square w-full overflow-hidden bg-zinc-50">
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-xs font-bold text-zinc-900 mb-2 leading-tight">{item.title}</h4>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center px-4">
            <p className="text-sm leading-relaxed text-zinc-500 font-medium italic">"{profile.description}"</p>
          </div>

          <div className="mt-16 mb-8 text-center">
            <p className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase mb-6 drop-shadow-sm">Scan QR to connect</p>
            <div className="inline-flex justify-center rounded-[2.5rem] bg-white p-6 shadow-xl border border-zinc-100">
              <QRCodeSVG value={window.location.origin + "/demo"} size={140} />
            </div>
          </div>
        </div>

        {/* Lead Form Floating Button */}
        <div className="fixed bottom-6 right-6 md:right-10 z-50">
          <Dialog open={leadFormOpen} onOpenChange={setLeadFormOpen}>
            <DialogTrigger asChild>
              <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-5 rounded-full text-sm font-black uppercase tracking-wider transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)] border border-orange-400 border-b-orange-600 border-b-4 hover:border-b-2 hover:-translate-y-1"
              >
                <MessageSquare className="h-5 w-5" /> Hire Me
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl w-[90vw] p-6 lg:p-8 bg-white border border-zinc-200 text-zinc-900 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold flex items-center gap-2 text-zinc-900 pb-2">
                  <div className="p-2 bg-orange-50 rounded-xl border border-orange-100">
                    <MessageSquare className="h-6 w-6 text-orange-500" />
                  </div>
                  Request a Quote
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={submitLead} className="space-y-4 pt-2">
                <div className="space-y-2 text-left">
                  <Label htmlFor="demo-name" className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Full Name</Label>
                  <Input id="demo-name" required placeholder="John Doe" className="bg-zinc-50 border-zinc-200 h-12 text-zinc-900 placeholder:text-zinc-400 rounded-xl focus:border-orange-500 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="demo-email" className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Email Address</Label>
                  <Input id="demo-email" type="email" required placeholder="john@example.com" className="bg-zinc-50 border-zinc-200 h-12 text-zinc-900 placeholder:text-zinc-400 rounded-xl focus:border-orange-500 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="demo-req" className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Project Details</Label>
                  <Textarea id="demo-req" rows={3} placeholder="How can I help you?" className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 resize-none rounded-xl focus:border-orange-500 focus:bg-white transition-colors" />
                </div>
                <Button type="submit" disabled={submittingLead} className="w-full h-14 mt-6 rounded-xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 shadow-lg shadow-orange-500/25">
                  {submittingLead ? 'Sending...' : 'Send Request'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default DemoProfile;
