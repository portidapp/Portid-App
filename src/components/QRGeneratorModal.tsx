import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, {
  Options,
  DrawType,
  TypeNumber,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
  FileExtension
} from 'qr-code-styling';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getThemeMainColor } from '@/lib/themes';
import { QrCode, Download, Image as ImageIcon, FileJson, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  brand_name: string;
  slug: string;
  theme: string;
}

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
}

const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({ isOpen, onClose, profiles }) => {
  const { planTier } = useAuth();
  const navigate = useNavigate();
  const isPremium = planTier === 'premium';
  const [size, setSize] = useState<number>(1024);
  const [transparent, setTransparent] = useState<boolean>(isPremium);

  useEffect(() => {
    setTransparent(isPremium);
  }, [isPremium]);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const selectedProfile = profiles[0];
  const profileUrl = selectedProfile ? `${window.location.origin}/p/${selectedProfile.slug}` : '';
  const mainColor = selectedProfile ? getThemeMainColor(selectedProfile.theme) : '#0f172a';

  const handleRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      qrRef.current = node;
      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling({
          width: 200,
          height: 200,
          type: 'svg' as DrawType,
          data: profileUrl,
          dotsOptions: {
            color: mainColor,
            type: 'rounded' as DotType
          },
          backgroundOptions: {
            color: transparent ? 'transparent' : '#ffffff',
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: 20
          }
        });
      }

      if (node.children.length === 0) {
        qrCodeInstance.current.append(node);
      }

      qrCodeInstance.current.update({
        data: profileUrl,
        dotsOptions: { color: mainColor },
        backgroundOptions: { color: transparent ? 'transparent' : '#ffffff' }
      });
    } else {
      qrRef.current = null;
    }
  }, [profileUrl, mainColor, transparent]);

  const handleDownload = async (extension: FileExtension) => {
    if (!qrCodeInstance.current) return;

    // Save current preview state
    const originalSize = 200;
    const originalBg = transparent ? 'transparent' : '#ffffff';

    try {
      qrCodeInstance.current.update({
        width: 1024,
        height: 1024,
        backgroundOptions: {
          color: extension === 'jpeg' ? '#ffffff' : originalBg,
        }
      });

      await qrCodeInstance.current.download({
        name: `qr-${selectedProfile?.brand_name.toLowerCase().replace(/\s+/g, '-') || 'profile'}`,
        extension: extension
      });
    } finally {
      qrCodeInstance.current.update({
        width: originalSize,
        height: originalSize,
        backgroundOptions: {
          color: originalBg,
        }
      });
    }
  };

  const displayThemeName = (theme: string) => {
    if (theme.startsWith('custom:')) return 'Custom Brand';
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] w-[95vw] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden outline-none">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-4 md:p-6 max-h-[90vh] overflow-y-auto scrollbar-hide text-left">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <QrCode className="h-5 w-5 text-primary" />
              QR Generator
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              High-resolution branded output.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">

            <div className="flex flex-col items-center justify-center space-y-3 rounded-[32px] bg-muted/20 p-4 md:p-6 border border-white/50 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_100%)]" />

              <div
                className="flex items-center justify-between w-full px-1 z-10 cursor-pointer animate-in fade-in"
                onClick={() => {
                  if (!isPremium) {
                    toast.error("Transparent background is a Premium plan feature. Please upgrade to unlock.");
                    navigate('/pricing');
                    onClose();
                  }
                }}
              >
                <Label htmlFor="transparency" className="text-[9px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
                  Transparent BG
                  {!isPremium && <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />}
                </Label>
                <Switch
                  id="transparency"
                  disabled={!isPremium}
                  checked={transparent}
                  onCheckedChange={setTransparent}
                  className="data-[state=checked]:bg-primary scale-75"
                />
              </div>

              <div className="relative z-10 transition-all duration-700 ease-out drop-shadow-xl scale-90 md:scale-100">
                <div ref={handleRef} />
              </div>

              <div className="z-10 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-3 py-1 border border-white/50 shadow-sm border-b">
                <div className="h-1.5 w-1.5 rounded-full shadow-inner" style={{ backgroundColor: mainColor }} />
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                  {displayThemeName(selectedProfile?.theme || '')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-1">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                onClick={() => handleDownload('png')}
              >
                <Download className="h-3.5 w-3.5" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-bold">PNG</span>
                  <span className="text-[8px] opacity-70">{transparent ? 'Transparent' : 'White'}</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-none bg-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                onClick={() => handleDownload('jpeg')}
              >
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-bold">JPG</span>
                  <span className="text-[8px] opacity-50">White</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRGeneratorModal;
