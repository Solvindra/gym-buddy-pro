import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { upgradeSubscription, downgradeSubscription } from "@/lib/store";
import { isPro, FREE_MEMBER_LIMIT, FREE_TRAINER_LIMIT, PRO_PRICE_INR } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, X, Zap, Users, UserCog, Wallet, Palette, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_owner/subscription")({
  component: SubscriptionPage,
});

const FREE_FEATURES = [
  { icon: Users, label: `Up to ${FREE_MEMBER_LIMIT} members`, included: true },
  { icon: UserCog, label: `Up to ${FREE_TRAINER_LIMIT} trainer`, included: true },
  { icon: Zap, label: "Attendance tracking", included: true },
  { icon: Zap, label: "Membership plan management", included: true },
  { icon: Wallet, label: "Revenue & expense tracking", included: false },
  { icon: TrendingUp, label: "Member footfall analytics", included: false },
  { icon: Palette, label: "Appearance & colour customisation", included: false },
];

const PRO_FEATURES = [
  { icon: Users, label: "Unlimited members", included: true },
  { icon: UserCog, label: "Unlimited trainers", included: true },
  { icon: Zap, label: "Attendance tracking", included: true },
  { icon: Zap, label: "Membership plan management", included: true },
  { icon: Wallet, label: "Revenue & expense tracking", included: true },
  { icon: TrendingUp, label: "Member footfall analytics", included: true },
  { icon: Palette, label: "Appearance & colour customisation", included: true },
];

function FeatureRow({ icon: Icon, label, included }: { icon: any; label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", included ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
        {included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </span>
      <span className={cn("text-sm", !included && "text-muted-foreground line-through")}>{label}</span>
    </div>
  );
}

function SubscriptionPage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [loading, setLoading] = useState(false);

  if (!gym || !session) return null;
  const pro = isPro(gym);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      upgradeSubscription(gym.gymId);
      setLoading(false);
      toast.success("Upgraded to Pro! All features are now unlocked.", { duration: 5000 });
    }, 1200);
  };

  const handleDowngrade = () => {
    downgradeSubscription(gym.gymId);
    toast.info("Downgraded to Free plan.");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and unlock all features.</p>
      </div>

      {/* Current plan badge */}
      <div className={cn(
        "flex items-center gap-3 rounded-2xl px-5 py-4 border",
        pro ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/40 border-border"
      )}>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", pro ? "bg-amber-500/20" : "bg-muted")}>
          <Crown className={cn("h-5 w-5", pro ? "text-amber-500" : "text-muted-foreground")} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {pro ? "Pro Plan — Active" : "Free Plan — Active"}
          </div>
          <div className="text-xs text-muted-foreground">
            {pro ? "All features unlocked" : `${gym.members.length}/${FREE_MEMBER_LIMIT} members · ${gym.trainers.length}/${FREE_TRAINER_LIMIT} trainer`}
          </div>
        </div>
        {pro && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white">PRO</span>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Free */}
        <Card className={cn("relative", !pro && "ring-2 ring-primary")}>
          {!pro && (
            <span className="absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">Current</span>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" /> Free
            </CardTitle>
            <div className="text-3xl font-bold">₹0 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
          </CardHeader>
          <CardContent className="space-y-0.5 divide-y">
            {FREE_FEATURES.map((f) => <FeatureRow key={f.label} {...f} />)}
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className={cn("relative border-amber-500/40", pro && "ring-2 ring-amber-500")}>
          {pro && (
            <span className="absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white">Current</span>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" /> Pro
            </CardTitle>
            <div className="text-3xl font-bold">
              ₹{PRO_PRICE_INR}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-0.5 divide-y">
            {PRO_FEATURES.map((f) => <FeatureRow key={f.label} {...f} />)}
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      {!pro ? (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <div className="font-bold text-lg flex items-center gap-2 justify-center sm:justify-start">
                <Crown className="h-5 w-5 text-amber-500" /> Upgrade to Pro
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Unlock unlimited members, trainers, revenue analytics, footfall charts, and full appearance customisation.
              </p>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 px-8"
              size="lg"
            >
              {loading ? "Activating…" : `Upgrade — ₹${PRO_PRICE_INR}/mo`}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          You are on the Pro plan.{" "}
          <button onClick={handleDowngrade} className="underline hover:text-foreground">
            Downgrade to Free
          </button>
        </p>
      )}
    </div>
  );
}
