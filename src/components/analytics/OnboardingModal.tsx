import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Zap, Radio, Code, Check, Copy, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (npub: string, relayUrl: string) => void;
}

const SNIPPET_CODE = `<script defer data-stall="YOUR_STALL_ID"
  src="https://zap-analytics.nostr.com/tracker.js">
</script>`;

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [npub, setNpub] = useState('');
  const [relayUrl, setRelayUrl] = useState('wss://relay.damus.io');
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Connect Your Identity',
      description: 'Paste your npub or connect with a NIP-07 browser extension',
    },
    {
      icon: <Radio className="h-5 w-5" />,
      title: 'Add a Relay',
      description: 'Which relay should we monitor for your shop activity?',
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: 'Embed Tracking Snippet',
      description: 'Add this privacy-preserving script to your shop',
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPET_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    onComplete(
      npub || 'npub1demo...placeholder',
      relayUrl || 'wss://relay.damus.io',
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg bg-[#0a0a0a] border-border/50 overflow-hidden [&>button]:hidden">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i <= step ? 'bg-bitcoin' : 'bg-secondary',
              )}
            />
          ))}
        </div>

        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              step === 0 ? 'bg-bitcoin/10 text-bitcoin' : step === 1 ? 'bg-purple/10 text-purple' : 'bg-emerald-500/10 text-emerald-500',
            )}>
              {steps[step].icon}
            </div>
            <div>
              <DialogTitle className="text-base">{steps[step].title}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">{steps[step].description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Your Nostr public key
                </label>
                <Input
                  placeholder="npub1..."
                  value={npub}
                  onChange={(e) => setNpub(e.target.value)}
                  className="font-mono text-xs bg-secondary/50 border-border/50 h-10"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0a0a0a] px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-border/50 text-xs h-10 hover:bg-bitcoin/5 hover:border-bitcoin/30 hover:text-bitcoin transition-all"
                onClick={() => setStep(1)}
              >
                <Zap className="h-3.5 w-3.5 mr-2" />
                Connect with NIP-07 Extension
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Relay WebSocket URL
                </label>
                <Input
                  placeholder="wss://relay.example.com"
                  value={relayUrl}
                  onChange={(e) => setRelayUrl(e.target.value)}
                  className="font-mono text-xs bg-secondary/50 border-border/50 h-10"
                />
              </div>
              <div className="rounded-lg bg-secondary/30 p-3 border border-border/30">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  We&apos;ll connect to this relay to monitor kind 30017 (stalls), kind 30018 (products),
                  and kind 9735 (zap receipts) events associated with your pubkey. No private data is collected.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <pre className="rounded-lg bg-[#0d0d0d] border border-border/30 p-4 text-[11px] leading-relaxed font-mono text-emerald-400 overflow-x-auto">
                  {SNIPPET_CODE}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3 border border-border/30">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="text-bitcoin font-semibold">Privacy-first:</span> This snippet uses daily rotating salts
                  for anonymous session grouping. No cookies, no IP storage, no personal data collected. Under 1KB gzipped.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-xs text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>

          {step < 2 ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
              className="text-xs bg-bitcoin hover:bg-bitcoin-dark text-black font-semibold"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              className="text-xs bg-bitcoin hover:bg-bitcoin-dark text-black font-semibold"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Start Tracking
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
