import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, UserCheck } from "lucide-react";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_owner/members/")({
  component: MembersList,
});

type FootfallMode = "monthly-joiners" | "daily-attendance";

const fmt = (n: number) => String(n);

function FootfallCard() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [mode, setMode] = useState<FootfallMode>("monthly-joiners");

  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  const chartData = useMemo(() => {
    if (!gym) return [];

    if (mode === "monthly-joiners") {
      // Last 12 months — count members whose createdAt falls in that month
      const months: string[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      return months.map((ym) => {
        const label = new Date(ym + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        const count = gym.members.filter((m) => m.createdAt.slice(0, 7) === ym).length;
        return { label, count };
      });
    } else {
      // Daily attendance for selected month
      const [y, mo] = selectedMonth.split("-").map(Number);
      const daysInMonth = new Date(y, mo, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        const dateStr = `${selectedMonth}-${day}`;
        const count = gym.members.filter((m) =>
          m.attendance.some((a) => a.startsWith(dateStr))
        ).length;
        return { label: String(i + 1), count };
      });
    }
  }, [gym, mode, selectedMonth]);

  if (!gym) return null;

  const totalJoined = gym.members.filter((m) => m.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = gym.members.filter((m) => m.attendance.some((a) => a.startsWith(today))).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {mode === "monthly-joiners"
                ? <Users className="h-4 w-4" />
                : <UserCheck className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-base">
                {mode === "monthly-joiners" ? "Monthly Joiners" : "Daily Attendance"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {mode === "monthly-joiners"
                  ? `${totalJoined} joined this month`
                  : `${todayCount} checked in today`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {mode === "daily-attendance" && (
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-8 text-xs w-36"
              />
            )}
            <Select value={mode} onValueChange={(v) => setMode(v as FootfallMode)}>
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly-joiners">Monthly Joiners</SelectItem>
                <SelectItem value="daily-attendance">Daily Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-44 pt-0">
        {chartData.every((d) => d.count === 0) ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={mode === "daily-attendance" ? 4 : 0}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={fmt} allowDecimals={false} />
              <Tooltip
                formatter={(v: number) => [v, mode === "monthly-joiners" ? "Joined" : "Attended"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                name={mode === "monthly-joiners" ? "Joined" : "Attended"}
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function MembersList() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [q, setQ] = useState("");
  if (!gym) return null;

  const filtered = gym.members.filter((m) =>
    m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">{gym.members.length} total members</p>
        </div>
        <Button asChild><Link to="/members/new"><Plus className="h-4 w-4 mr-1" /> New Member</Link></Button>
      </div>

      <FootfallCard />

      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">
          No members yet. <Link to="/members/new" className="text-primary hover:underline">Add your first one</Link>.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => {
            const status = getMemberStatus(m);
            return (
              <Link key={m.id} to="/members/$id" params={{ id: m.id }}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center font-semibold text-accent-foreground">
                        {m.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.phone} · {m.bloodGroup}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={status === "active" ? "default" : status === "expired" ? "destructive" : "secondary"}>
                        {status}
                      </Badge>
                      {status === "active" && (
                        <div className="text-xs text-muted-foreground mt-1">{daysRemaining(m)}d left</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
