import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { isPro } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Wallet, AlertCircle, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_owner/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  if (!gym) return null;

  const today = new Date().toISOString().slice(0, 10);
  const active = gym.members.filter((m) => getMemberStatus(m) === "active");
  const expiringSoon = active.filter((m) => daysRemaining(m) <= 7);
  const presentToday = gym.members.filter((m) => m.attendance.includes(today)).length;
  const revenueThisMonth = gym.members.reduce((sum, m) => {
    const month = new Date().toISOString().slice(0, 7);
    return sum + m.periods.filter((p) => p.payment.date.slice(0, 7) === month).reduce((s, p) => s + p.payment.total, 0);
  }, 0);
  const pro = isPro(gym);

  const footfallData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const count = gym.members.filter((m) => m.attendance.includes(iso)).length;
      days.push({ date: iso, label, count });
    }
    return days;
  }, [gym]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {gym.ownerName} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening at {gym.gymName}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Active members" value={active.length} />
        <Stat icon={ClipboardCheck} label="Present today" value={presentToday} />
        <Stat icon={AlertCircle} label="Expiring in 7 days" value={expiringSoon.length} accent="warning" />
        <Stat icon={Wallet} label="Revenue this month" value={`₹${revenueThisMonth.toLocaleString()}`} />
      </div>

      {/* Member footfall chart (Pro) */}
      {pro ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Member Footfall — Last 30 Days
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Daily attendance count across all members</p>
            </div>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={footfallData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="footfallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                  formatter={(v: number) => [v, "Members present"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#footfallGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                <Crown className="h-4 w-4 text-amber-500" /> Member Footfall Analytics
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">See daily attendance trends over the last 30 days. Available on the Pro plan.</p>
            </div>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
              <Link to="/subscription">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Expiring soon</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/members">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">No memberships expiring this week. 🎉</p>
            ) : (
              <ul className="divide-y">
                {expiringSoon.slice(0, 5).map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <Link to="/members/$id" params={{ id: m.id }} className="font-medium hover:underline">{m.name}</Link>
                    <span className="text-xs text-warning font-medium">{daysRemaining(m)} days left</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button asChild variant="secondary"><Link to="/members/new">+ New Member</Link></Button>
            <Button asChild variant="secondary"><Link to="/attendance">Mark Attendance</Link></Button>
            <Button asChild variant="secondary"><Link to="/trainers">Add Trainer</Link></Button>
            <Button asChild variant="secondary"><Link to="/plans">Manage Plans</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: any; accent?: "warning" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent === "warning" ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
