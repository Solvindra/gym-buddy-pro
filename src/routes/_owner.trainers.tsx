import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addTrainer, removeTrainer } from "@/lib/store";
import { canAddTrainer, FREE_TRAINER_LIMIT, isPro } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Copy, Crown, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/trainers")({
  component: TrainersPage,
});

function TrainersPage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  if (!gym) return null;
  const trainerLimitReached = !canAddTrainer(gym);
  const pro = isPro(gym);

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Trainers</h1>
        <p className="text-sm text-muted-foreground">
          Trainers sign in using their Trainer ID and password
          {!pro && ` · ${gym.trainers.length}/${FREE_TRAINER_LIMIT} trainer used`}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Active trainers</CardTitle></CardHeader>
        <CardContent>
          {gym.trainers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trainers yet.</p>
          ) : (
            <ul className="divide-y">
              {gym.trainers.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">{t.trainerId}</span>
                      <button
                        className="ml-1 hover:text-foreground transition-colors"
                        title="Copy Trainer ID"
                        onClick={() => {
                          navigator.clipboard.writeText(t.trainerId);
                          toast.success("Trainer ID copied!");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {t.phone && <span>· {t.phone}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { removeTrainer(gym.gymId, t.id); toast.success("Trainer removed"); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {trainerLimitReached ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">Trainer limit reached</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Free plan allows <strong>{FREE_TRAINER_LIMIT} trainer</strong>. Upgrade to Pro for unlimited trainers.
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link to="/subscription"><Crown className="h-4 w-4 mr-2" /> Upgrade to Pro</Link>
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Add trainer</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="sm:col-span-2">
              <Button onClick={() => {
                if (!form.name || !form.password) return toast.error("Name and password are required");
                const t = addTrainer(gym.gymId, form);
                if (!t) return toast.error("Could not add trainer");
                setForm({ name: "", phone: "", password: "" });
                toast.success(`Trainer added! Share their Trainer ID: ${t.trainerId}`, { duration: 8000 });
              }}>Add trainer</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
