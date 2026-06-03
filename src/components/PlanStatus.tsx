import React from 'react';
import { Crown, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

interface PlanStatusProps {
  planTier: string | null;
  profilesCount: number; // kept for prop compatibility, though unused
  isMobile?: boolean;
}

export const PlanStatus = ({ planTier = 'basic', isMobile = false }: PlanStatusProps) => {
  const navigate = useNavigate();
  const tier = planTier?.toLowerCase() || 'basic';

  const getTierStyles = () => {
    switch (tier) {
      case 'premium':
        return {
          label: 'Premium',
          badge: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: <Crown className="h-3 w-3 fill-purple-500 text-purple-500" />,
          color: 'text-purple-700'
        };
      default:
        return {
          label: 'Basic Plan',
          badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
          icon: null,
          color: 'text-zinc-600'
        };
    }
  };

  const styles = getTierStyles();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (isMobile) {
    return (
      <div className="w-full bg-zinc-50 border-y border-zinc-100 px-4 py-2 flex items-center justify-between sticky top-[64px] z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${styles.badge} rounded-full px-2 py-0 h-6 text-[10px] uppercase font-bold`}>
            {styles.icon && <span className="mr-1">{styles.icon}</span>}
            {styles.label}
          </Badge>
        </div>
        {tier !== 'premium' && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleUpgrade}
            className="h-8 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1 pr-1"
          >
            Upgrade <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 group outline-none">
                  <Badge variant="outline" className={`${styles.badge} rounded-full pl-2 pr-3 py-1 transition-all group-hover:shadow-md cursor-pointer border-2`}>
                    <div className="flex items-center gap-1.5">
                      {styles.icon}
                      <span className="text-xs font-bold uppercase tracking-tight">{styles.label}</span>
                      <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Badge>
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="p-3 max-w-[200px] bg-white border-zinc-100 shadow-xl rounded-2xl">
              <p className="text-xs font-bold text-zinc-800">You are on {styles.label}</p>
              {tier === 'basic' && (
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Upgrade to unlock product catalogs, capture leads, remove branding, and access advanced analytics.
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent align="end" className="w-64 p-4 rounded-3xl shadow-2xl border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Current Status</h3>
              <Badge className={styles.badge}>{styles.label}</Badge>
            </div>

            {tier !== 'premium' && (
              <>
                <DropdownMenuSeparator className="my-4 opacity-50" />
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Premium Benefits</h4>
                  <ul className="space-y-2">
                    {[
                      'Products & Services Catalog',
                      'Automated Lead Collection',
                      'Custom Theme Engine',
                      'Remove Portid Watermark'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] font-medium text-zinc-600">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 border-0 h-10 rounded-xl font-bold text-xs hover:opacity-90 transition-all mt-2"
                  >
                    Upgrade Plan <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {tier !== 'premium' && (
        <Button 
          onClick={handleUpgrade}
          className="hidden md:flex bg-orange-500 text-white hover:bg-orange-600 shadow-sm border-0 h-9 rounded-xl font-bold text-xs"
        >
          Upgrade
        </Button>
      )}
    </div>
  );
};
