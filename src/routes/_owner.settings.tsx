import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addPlan, removePlan } from "@/lib/store";
import { isPro } from "@/lib/subscription";
import { AppearancePanel } from "@/components/AppearancePanel";
import { ChartColorsCard } from "@/components/ChartColorsCard";
import { UpgradeBanner } from "@/components/UpgradeGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, User, Trash2, Plus, ListChecks, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_owner/settings")({
  component: SettingsPage,
});

function AccordionSection({
  icon: Icon,
  iconColor,
  title,
  description,
  defaultOpen = false,
  locked = false,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  defaultOpen?: boolean;
  locked?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
      >
        <span
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconColor + "20", color: iconColor }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight flex items-center gap-2">
            {title}
            {locked && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">PRO</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4 bg-muted/10">
          {children}
        </div>
      )}
    </div>
  );
}

function PlansContent() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [price, setPrice] = useState(0);
  if (!gym) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Existing plans</CardTitle></CardHeader>
        <CardContent className="p-0">
          {gym.plans.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-4">No plans yet. Add one below.</p>
          ) : (
            <ul className="divide-y">
              {gym.plans.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.durationDays} days · ₹{p.price}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { removePlan(gym.gymId, p.id); toast.success("Removed"); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add new plan</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Days</Label><Input type="number" value={days || ""} onChange={(e) => setDays(+e.target.value)} /></div>
          <div><Label>Price ₹</Label><Input type="number" value={price || ""} onChange={(e) => setPrice(+e.target.value)} /></div>
          <div className="sm:col-span-4">
            <Button onClick={() => {
              if (!name || !days) return toast.error("Name and days required");
              addPlan(gym.gymId, { name, durationDays: days, price });
              setName(""); setDays(30); setPrice(0);
              toast.success("Plan added");
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsPage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  if (!gym) return null;
  const pro = isPro(gym);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="pb-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Tap a section to expand or collapse it.</p>
      </div>

      <AccordionSection
        icon={ListChecks}
        iconColor="#6366f1"
        title="Plan Settings"
        description="Add or remove the membership plans your gym offers."
        defaultOpen
      >
        <PlansContent />
      </AccordionSection>

      <AccordionSection
        icon={User}
        iconColor="#3b82f6"
        title="Owner App Appearance"
        description="Customize your personal theme, accent colour, and chart colours."
        locked={!pro}
      >
        {!pro ? (
          <UpgradeBanner feature="Appearance & Colour Customisation" locked />
        ) : (
          <div className="space-y-6">
            <AppearancePanel role="owner" />
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Chart Colors</p>
              <ChartColorsCard />
            </div>
          </div>
        )}
      </AccordionSection>

      <AccordionSection
        icon={UserCog}
        iconColor="#f97316"
        title="Trainer App Appearance"
        description="Set the default look for all trainers."
        locked={!pro}
      >
        {!pro ? (
          <UpgradeBanner feature="Trainer Appearance Customisation" locked />
        ) : (
          <AppearancePanel role="trainer" />
        )}
      </AccordionSection>
    </div>
  );
}
