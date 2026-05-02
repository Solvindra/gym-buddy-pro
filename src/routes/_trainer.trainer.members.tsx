import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Heart } from "lucide-react";

export const Route = createFileRoute("/_trainer/trainer/members")({
  component: TrainerMembers,
});

function TrainerMembers() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  if (!gym) return null;
  const filtered = gym.members.filter((m) =>
    m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q)
  );
  void Link;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="text-sm text-muted-foreground">Read-only member directory</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-2">
        {filtered.map((m) => {
          const status = getMemberStatus(m);
          const open = openId === m.id;
          return (
            <Card key={m.id}>
              <CardContent className="p-4">
                <button onClick={() => setOpenId(open ? null : m.id)} className="w-full flex items-center gap-3 text-left">
                  {m.photo ? (
                    <img src={m.photo} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center font-semibold">{m.name[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.phone}</div>
                  </div>
                  <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
                </button>
                {open && (
                  <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {m.phone}</div>
                    <div className="flex items-center gap-2"><Heart className="h-3.5 w-3.5 text-muted-foreground" /> Blood: {m.bloodGroup}</div>
                    {m.emergencyContact && <div>Emergency: {m.emergencyContact}</div>}
                    {status === "active" && <div className="text-success">{daysRemaining(m)} days remaining</div>}
                    <div>Attendance: {m.attendance.length} days</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
