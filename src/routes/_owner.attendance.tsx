import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { markAttendance, unmarkAttendance, getMemberStatus } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";

export const Route = createFileRoute("/_owner/attendance")({
  component: () => <AttendancePage role="owner" />,
});

export function AttendancePage({ role }: { role: "owner" | "trainer" }) {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [q, setQ] = useState("");
  if (!gym) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const filtered = gym.members.filter((m) =>
    getMemberStatus(m) !== "cancelled" &&
    (m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q))
  );
  const presentCount = gym.members.filter((m) => m.attendance.includes(today)).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground">{todayLabel} · {presentCount} present today</p>
        {role === "trainer" && <p className="text-xs text-muted-foreground mt-1">Trainer view — tap to mark/unmark</p>}
      </div>

      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search member" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-2">
        {filtered.map((m) => {
          const present = m.attendance.includes(today);
          return (
            <Card key={m.id}>
              <CardContent className="p-3 flex items-center gap-3">
                {m.photo ? (
                  <img src={m.photo} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-semibold">{m.name[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.phone}</div>
                </div>
                <button
                  onClick={() => { present ? unmarkAttendance(gym.gymId, m.id) : markAttendance(gym.gymId, m.id); }}
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    present ? "bg-success text-success-foreground" : "bg-secondary hover:bg-accent"
                  }`}
                  aria-label={present ? "Mark absent" : "Mark present"}
                >
                  <Check className="h-5 w-5" />
                </button>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No members found.</div>}
      </div>
    </div>
  );
}
