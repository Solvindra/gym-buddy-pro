import { Link } from "@tanstack/react-router";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRO_PRICE_INR } from "@/lib/subscription";

interface UpgradeGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
  locked: boolean;
}

export function UpgradeGate({ feature, description, children, locked }: UpgradeGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-20">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-card border shadow-2xl rounded-2xl p-6 max-w-sm mx-4 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
            <Crown className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{feature}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description ?? `Upgrade to Pro to unlock ${feature}.`}
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            Only ₹{PRO_PRICE_INR} / month
          </div>
          <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            <Link to="/subscription">
              <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface UpgradeBannerProps {
  feature: string;
  locked: boolean;
}

export function UpgradeBanner({ feature, locked }: UpgradeBannerProps) {
  if (!locked) return null;
  return (
    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm">
      <Lock className="h-4 w-4 text-amber-500 shrink-0" />
      <span className="text-amber-700 dark:text-amber-400 flex-1">
        <strong>{feature}</strong> is locked on the Free plan.
      </span>
      <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
        <Link to="/subscription">
          <Crown className="h-3.5 w-3.5 mr-1" /> Upgrade
        </Link>
      </Button>
    </div>
  );
}
