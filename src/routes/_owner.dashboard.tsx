import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    return (
      sum +
      m.periods
        .filter((p) => p.payment.date.slice(0, 7) === month)
        .reduce((s, p) => s + p.payment.total, 0)
    );
  }, 0);

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
                    <Link to="/members/$id" params={{ id: m.id }} className="font-medium hover:underline">
                      {m.name}
                    </Link>
                    <span className="text-xs text-warning font-medium">{daysRemaining(m)} days left</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
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
