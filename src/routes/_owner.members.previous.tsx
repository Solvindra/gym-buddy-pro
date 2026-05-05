import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSession, useGym } from "@/lib/useStore";
import { getMemberStatus, extendMembership } from "@/lib/store";
import { isPro } from "@/lib/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Crown, UserX, ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_owner/members/previous")({
  component: PreviousMembers,
});

function PreviousMembers() {
  const session = useSession();
  const gym = useGym(session?.gymId);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [extendTarget, setExtendTarget] = useState<string | null>(null);

  if (!gym) return null;

  if (!isPro(gym)) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/members"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Previous Members</h1>
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

  const extendMember = gym.members.find((m) => m.id === extendTarget);

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
              <Card key={m.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  {/* Avatar — clicking navigates to profile */}
                  <button
                    onClick={() => navigate({ to: "/members/$id", params: { id: m.id } })}
                    className="shrink-0"
                  >
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} className="h-12 w-12 rounded-full object-cover grayscale hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground hover:bg-muted/70 transition-colors">
                        {m.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Info — clicking name navigates to profile */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate({ to: "/members/$id", params: { id: m.id } })}
                      className="font-semibold text-left hover:text-primary transition-colors truncate block w-full"
                    >
                      {m.name}
                    </button>
                    <div className="text-xs text-muted-foreground truncate">
                      {m.phone} · {lastPlanName}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant={status === "expired" ? "destructive" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {status}
                      </Badge>
                      {endDate && (
                        <span className="text-[10px] text-muted-foreground">ended {endDate}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">₹{totalSpent.toLocaleString()} total</span>
                    </div>
                  </div>

                  {/* Extend (+) button */}
                  <button
                    onClick={() => setExtendTarget(m.id)}
                    className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Extend membership"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Extend membership dialog */}
      {extendMember && (
        <ExtendDialog
          gymId={gym.gymId}
          member={extendMember}
          plans={gym.plans}
          open={!!extendTarget}
          onClose={() => setExtendTarget(null)}
        />
      )}
    </div>
  );
}

function ExtendDialog({
  gymId,
  member,
  plans,
  open,
  onClose,
}: {
  gymId: string;
  member: { id: string; name: string };
  plans: { id: string; name: string; durationDays: number; price: number }[];
  open: boolean;
  onClose: () => void;
}) {
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [upi, setUpi] = useState(0);
  const [cash, setCash] = useState(0);
  const total = method === "split" ? upi + cash : method === "upi" ? upi : cash;
  const selectedPlan = plans.find((p) => p.id === planId);

  const handleExtend = () => {
    if (!planId || total <= 0) return toast.error("Pick a plan and enter the amount");
    extendMembership(gymId, member.id, planId, {
      method,
      upiAmount: method === "cash" ? 0 : upi,
      cashAmount: method === "upi" ? 0 : cash,
      total,
      date: new Date().toISOString(),
    });
    toast.success(`${member.name}'s membership extended — now active`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Extend — {member.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.durationDays}d · ₹{p.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlan && (
              <p className="text-xs text-muted-foreground">Suggested: ₹{selectedPlan.price}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
              className="grid grid-cols-3 gap-2 mt-1"
            >
              {(["cash", "upi", "split"] as PaymentMethod[]).map((mm) => (
                <Label
                  key={mm}
                  className={`border rounded-lg px-3 py-2 cursor-pointer text-center text-sm font-medium capitalize transition-all ${
                    method === mm ? "border-primary bg-primary/5 text-primary" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={mm} className="sr-only" />
                  {mm === "split" ? "UPI + Cash" : mm.toUpperCase()}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(method === "upi" || method === "split") && (
              <div className="space-y-1.5">
                <Label>UPI ₹</Label>
                <Input type="number" value={upi || ""} onChange={(e) => setUpi(+e.target.value)} />
              </div>
            )}
            {(method === "cash" || method === "split") && (
              <div className="space-y-1.5">
                <Label>Cash ₹</Label>
                <Input type="number" value={cash || ""} onChange={(e) => setCash(+e.target.value)} />
              </div>
            )}
          </div>

          <div className="rounded-lg bg-accent/50 px-4 py-3 text-sm flex justify-between items-center">
            <span className="text-muted-foreground">Total received</span>
            <span className="font-bold text-base">₹{total.toLocaleString()}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExtend}>
            <Plus className="h-4 w-4 mr-1" /> Extend &amp; Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
