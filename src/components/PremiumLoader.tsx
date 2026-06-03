import { motion } from 'framer-motion';

export const PremiumLoader = ({ fullScreen = true }: { fullScreen?: boolean }) => {
  const loaderContent = (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center">
        {/* Multi-Layered Vibrant Ripples (Micro) */}
        {[
          { color: 'bg-orange-500/10', delay: 0 },
          { color: 'bg-amber-500/10', delay: 0.5 }
        ].map((ripple, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ 
              scale: [0.8, 1.8],
              opacity: [0.6, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: ripple.delay,
              ease: "easeOut"
            }}
            className={`absolute inset-0 rounded-full ${ripple.color} blur-[2px]`}
          />
        ))}

        {/* Dynamic Glow Pulse (Micro) */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/15 to-amber-500/15 blur-lg"
        />

        {/* High-Contrast "Poppy" Bouncy Icon (Micro Version) */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: 1
          }}
          transition={{ 
            scale: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "backOut"
            },
            opacity: { duration: 0.3 }
          }}
          className="z-10 flex items-center justify-center p-1.5"
        >
          <img 
            src="/loader.png" 
            alt="Loading..." 
            className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_5px_15px_rgba(249,115,22,0.2)]" 
          />
        </motion.div>

        {/* Sleek Orbit Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[1px] border-orange-500/15"
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-3xl"
      >
        {loaderContent}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center py-24 w-full">
      {loaderContent}
    </div>
  );
};
