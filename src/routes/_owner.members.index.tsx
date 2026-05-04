import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { isPro } from "@/lib/subscription";
import { UpgradeGate } from "@/components/UpgradeGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, UserCheck } from "lucide-react";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Dot,
} from "recharts";

export const Route = createFileRoute("/_owner/members/")({
  component: MembersList,
});

type FootfallMode = "monthly-joiners" | "daily-attendance";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function FootfallCard() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [mode, setMode] = useState<FootfallMode>("monthly-joiners");
  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(() => String(now.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(() => now.toISOString().slice(0, 7));

  const years = useMemo(() => {
    const y = now.getFullYear();
    return [String(y), String(y - 1), String(y - 2)];
  }, []);

  const chartData = useMemo(() => {
    if (!gym) return [];

    if (mode === "monthly-joiners") {
      return MONTHS_SHORT.map((label, i) => {
        const ym = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
        const count = gym.members.filter((m) => m.createdAt.slice(0, 7) === ym).length;
        return { label, count };
      });
    } else {
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
  }, [gym, mode, selectedYear, selectedMonth]);

  if (!gym) return null;

  const thisMonth = now.toISOString().slice(0, 7);
  const today = now.toISOString().slice(0, 10);
  const statValue = mode === "monthly-joiners"
    ? gym.members.filter((m) => m.createdAt.slice(0, 7) === thisMonth).length
    : gym.members.filter((m) => m.attendance.some((a) => a.startsWith(today))).length;
  const statLabel = mode === "monthly-joiners" ? "joined this month" : "checked in today";

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {mode === "monthly-joiners" ? <Users className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">
              {mode === "monthly-joiners" ? "Monthly Joiners" : "Daily Attendance"}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{statValue}</span> {statLabel}
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex gap-2 flex-wrap">
          <Select value={mode} onValueChange={(v) => setMode(v as FootfallMode)}>
            <SelectTrigger className="h-8 text-xs flex-1 min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly-joiners">Monthly Joiners</SelectItem>
              <SelectItem value="daily-attendance">Daily Attendance</SelectItem>
            </SelectContent>
          </Select>

          {mode === "monthly-joiners" ? (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-8 text-xs w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-8 text-xs w-32"
            />
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 px-1 pb-3">
        {chartData.every((d) => d.count === 0) ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={mode === "daily-attendance" ? 4 : 0}
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
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
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={<Dot r={3} fill="var(--primary)" stroke="var(--primary)" />}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
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

      <UpgradeGate
        feature="Monthly Joiners & Daily Attendance Analytics"
        description="Upgrade to Pro to see joiner trends and daily attendance charts."
        locked={!isPro(gym)}
      >
        <FootfallCard />
      </UpgradeGate>

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
