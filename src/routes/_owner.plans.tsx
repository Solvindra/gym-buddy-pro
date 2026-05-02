import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addPlan, removePlan } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/plans")({
  component: PlansPage,
});

function PlansPage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [price, setPrice] = useState(0);
  if (!gym) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Membership plans</h1>
        <p className="text-sm text-muted-foreground">Add or remove the plans your gym offers</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Existing plans</CardTitle></CardHeader>
        <CardContent>
          {gym.plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plans yet. Add one below.</p>
          ) : (
            <ul className="divide-y">
              {gym.plans.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
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
            }}><Plus className="h-4 w-4 mr-1" /> Add plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
