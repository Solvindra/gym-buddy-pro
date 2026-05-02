import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addTrainer, removeTrainer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/trainers")({
  component: TrainersPage,
});

function TrainersPage() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [form, setForm] = useState({ name: "", phone: "", username: "", password: "" });
  if (!gym) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Trainers</h1>
        <p className="text-sm text-muted-foreground">Trainers can sign in to mark attendance and view members</p>
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
                    <div className="text-xs text-muted-foreground">@{t.username} · {t.phone}</div>
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

      <Card>
        <CardHeader><CardTitle className="text-base">Add trainer</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <Button onClick={() => {
              if (!form.name || !form.username || !form.password) return toast.error("Name, username, password required");
              const t = addTrainer(gym.gymId, form);
              if (!t) return toast.error("Username already taken");
              setForm({ name: "", phone: "", username: "", password: "" });
              toast.success(`Trainer added! Share Gym ID ${gym.gymId} with them.`);
            }}>Add trainer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
