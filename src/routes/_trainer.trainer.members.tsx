import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, daysRemaining } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/_trainer/trainer/members")({
  component: TrainerMembers,
});

function TrainerMembers() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [q, setQ] = useState("");
  if (!gym) return null;

  const filtered = gym.members.filter(
    (m) =>
      m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">{gym.members.length} total members</p>
        </div>
        <Button asChild>
          <Link to="/trainer/members/new">
            <Plus className="h-4 w-4 mr-1" /> New Member
          </Link>
        </Button>
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
          <CardContent className="p-10 text-center text-muted-foreground">
            No members yet.{" "}
            <Link to="/trainer/members/new" className="text-primary hover:underline">
              Add your first one
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => {
            const status = getMemberStatus(m);
            return (
              <Link key={m.id} to="/trainer/members/$id" params={{ id: m.id }}>
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
                      <Badge
                        variant={
                          status === "active"
                            ? "default"
                            : status === "expired"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                      {status === "active" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {daysRemaining(m)}d left
                        </div>
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
