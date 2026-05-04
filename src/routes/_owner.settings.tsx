import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addPlan, removePlan } from "@/lib/store";
import { AppearancePanel } from "@/components/AppearancePanel";
import { ChartColorsCard } from "@/components/ChartColorsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, User, BarChart2, Trash2, Plus, ListChecks } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [price, setPrice] = useState(0);

  if (!gym) return null;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage plans, appearance, and chart colours.</p>
      </div>

      {/* ── Membership Plans ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">Membership Plans</h2>
            <p className="text-xs text-muted-foreground">Add or remove the plans your gym offers.</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Existing plans</CardTitle></CardHeader>
          <CardContent className="p-0">
            {gym.plans.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-5">No plans yet. Add one below.</p>
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
          <CardHeader><CardTitle className="text-base">Add new plan</CardTitle></CardHeader>
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
      </section>

      <div className="border-t" />

      {/* ── Your Appearance ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">Your Appearance</h2>
            <p className="text-xs text-muted-foreground">Only you (the owner) see these settings.</p>
          </div>
        </div>
        <AppearancePanel role="owner" />
      </section>

      <div className="border-t" />

      {/* ── Chart Colors ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">Chart Colors</h2>
            <p className="text-xs text-muted-foreground">Customize bar colors shown in the Revenue graphs.</p>
          </div>
        </div>
        <ChartColorsCard />
      </section>

      <div className="border-t" />

      {/* ── Trainer Appearance ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <UserCog className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">Trainer Appearance</h2>
            <p className="text-xs text-muted-foreground">
              Set the default look for all trainers. Trainers can also change this themselves.
            </p>
          </div>
        </div>
        <AppearancePanel role="trainer" />
      </section>
    </div>
  );
}
