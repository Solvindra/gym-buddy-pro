import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { isPro } from "@/lib/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, UserX, ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_owner/members/previous")({
  component: PreviousMembers,
});

function PreviousMembers() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [q, setQ] = useState("");

  if (!gym) return null;

  if (!isPro(gym)) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/members"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Previous Members</h1>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-10 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto">
            <Crown className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Previous Members is a Pro feature</h3>
            <p className="text-sm text-muted-foreground mt-1">
              View expired and cancelled memberships, full history, and re-engagement insights with the Pro plan.
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link to="/subscription"><Crown className="h-4 w-4 mr-2" /> Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    );
  }

  const previous = gym.members.filter((m) => {
    const s = getMemberStatus(m);
    return s === "expired" || s === "cancelled";
  });

  const filtered = previous.filter(
    (m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/members"><ArrowLeft className="h-4 w-4 mr-1" /> Current Members</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Previous Members</h1>
        <p className="text-sm text-muted-foreground">
          {previous.length} expired or cancelled member{previous.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or phone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <UserX className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              {previous.length === 0
                ? "No expired or cancelled members yet."
                : "No members match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => {
            const status = getMemberStatus(m);
            const lastPeriod = m.periods[m.periods.length - 1];
            const lastPlanName = lastPeriod?.planName ?? "—";
            const endDate = lastPeriod
              ? new Date(lastPeriod.endDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : null;
            const totalSpent = m.periods.reduce((s, p) => s + p.payment.total, 0);

            return (
              <Link key={m.id} to="/members/$id" params={{ id: m.id }}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-80 hover:opacity-100">
                  <CardContent className="p-4 flex items-center gap-4">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover grayscale" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground">
                        {m.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {m.phone} · {lastPlanName}
                        {endDate && <> · ended {endDate}</>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total paid: ₹{totalSpent.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={status === "expired" ? "destructive" : "secondary"}>
                        {status}
                      </Badge>
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
