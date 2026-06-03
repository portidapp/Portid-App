import { useState, useEffect } from "react";
import { HelpCircle, X, Send, Loader2, Phone, User, Mail, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SupportButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || ""
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_enquiries").insert({
        user_id: user?.id,
        name: formData.name || "Unknown",
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: "pending"
      });

      if (error) throw error;

      toast.success("Help request sent! We'll get back to you soon.");
      setFormData(prev => ({ ...prev, message: "" }));
      setIsOpen(false);
    } catch (error: any) {
      console.error("Support error:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-zinc-900 text-white p-4 rounded-full shadow-2xl shadow-black/20 hover:bg-zinc-800 transition-colors group flex items-center gap-2"
        >
          <HelpCircle className="h-6 w-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-sm whitespace-nowrap px-0 group-hover:px-1">
            How can we help?
          </span>
        </motion.button>
      </div>

      {/* Support Modal/Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[51]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] bg-white rounded-[2rem] shadow-2xl border border-zinc-100 p-6 z-[52] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    Contact Support
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">We usually respond within 2 hours.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      placeholder="Your name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Your Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Textarea 
                      placeholder="How can we help you today?"
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="pl-10 min-h-[120px] rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium resize-none py-3"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all border-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
