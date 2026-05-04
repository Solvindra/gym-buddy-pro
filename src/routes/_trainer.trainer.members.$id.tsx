import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import {
  cancelMembership,
  extendMembership,
  updateMedical,
  markAttendance,
  unmarkAttendance,
  getMemberStatus,
  daysRemaining,
  getCurrentPeriod,
} from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Phone, Heart, Ban, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_trainer/trainer/members/$id")({
  component: TrainerMemberDetail,
});

function TrainerMemberDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useSession();
  const gym = useGym(session?.gymId);
  const m = gym?.members.find((x) => x.id === id);

  if (!gym || !m) {
    return (
      <div>
        Member not found.{" "}
        <Link to="/trainer/members" className="text-primary">Back</Link>
      </div>
    );
  }

  const status = getMemberStatus(m);
  const period = getCurrentPeriod(m);
  const totalDays = m.periods.reduce((s, p) => s + p.durationDays, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/trainer/members" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start">
          {m.photo ? (
            <img src={m.photo} className="h-24 w-24 rounded-xl object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-accent flex items-center justify-center text-3xl font-bold">
              {m.name[0]}
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{m.name}</h1>
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
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {m.phone}</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {m.bloodGroup}</span>
              {m.emergencyContact && <span>Emergency: {m.emergencyContact}</span>}
            </div>
            {period && (
              <div className="text-sm">
                <span className="text-muted-foreground">Plan:</span> <b>{period.planName}</b> ·{" "}
                <span className="text-muted-foreground">Ends:</span>{" "}
                {new Date(period.endDate).toLocaleDateString()}{" "}
                {status === "active" && (
                  <span className="text-success font-medium">({daysRemaining(m)}d left)</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <ExtendDialog gymId={gym.gymId} memberId={m.id} plans={gym.plans} />
            {status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Cancel this membership?")) {
                    cancelMembership(gym.gymId, m.id);
                    toast.success("Membership cancelled");
                  }
                }}
              >
                <Ban className="h-4 w-4 mr-1" /> Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Stat label="Total days enrolled" value={totalDays} />
            <Stat label="Days attended" value={m.attendance.length} />
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceCalendar member={m} gymId={gym.gymId} />
        </TabsContent>

        <TabsContent value="medical">
          <MedicalForm gymId={gym.gymId} memberId={m.id} initial={m.medical} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {m.periods.map((p) => (
                  <li key={p.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.planName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.startDate).toLocaleDateString()} →{" "}
                        {new Date(p.endDate).toLocaleDateString()} · {p.durationDays} days
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground capitalize">
                        {p.payment.method === "split"
                          ? `UPI ₹${p.payment.upiAmount} + Cash ₹${p.payment.cashAmount}`
                          : p.payment.method}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function AttendanceCalendar({ member, gymId }: { member: any; gymId: string }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const todayKey = today.toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(year, mo - 1, 1))}>‹</Button>
          <div className="font-medium">
            {month.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(year, mo + 1, 1))}>›</Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = new Date(year, mo, d).toISOString().slice(0, 10);
            const present = member.attendance.includes(key);
            const isToday = key === todayKey;
            return (
              <button
                key={i}
                onClick={() => {
                  if (present) unmarkAttendance(gymId, member.id, key);
                  else markAttendance(gymId, member.id, key);
                }}
                className={`aspect-square rounded-md text-sm transition-colors ${
                  present
                    ? "bg-success text-success-foreground font-semibold"
                    : "hover:bg-accent"
                } ${isToday ? "ring-2 ring-primary" : ""}`}
              >
                {d}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground mt-3">
          Click any day to toggle attendance.
        </div>
      </CardContent>
    </Card>
  );
}

function MedicalForm({
  gymId,
  memberId,
  initial,
}: {
  gymId: string;
  memberId: string;
  initial?: any;
}) {
  const [med, setMed] = useState({
    height: initial?.height || "",
    weight: initial?.weight || "",
    conditions: initial?.conditions || "",
    allergies: initial?.allergies || "",
    medications: initial?.medications || "",
    notes: initial?.notes || "",
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Medical info</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Height (cm)</Label>
            <Input value={med.height} onChange={(e) => setMed({ ...med, height: e.target.value })} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input value={med.weight} onChange={(e) => setMed({ ...med, weight: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Existing conditions</Label>
          <Textarea rows={2} value={med.conditions} onChange={(e) => setMed({ ...med, conditions: e.target.value })} />
        </div>
        <div>
          <Label>Allergies</Label>
          <Textarea rows={2} value={med.allergies} onChange={(e) => setMed({ ...med, allergies: e.target.value })} />
        </div>
        <div>
          <Label>Current medications</Label>
          <Textarea rows={2} value={med.medications} onChange={(e) => setMed({ ...med, medications: e.target.value })} />
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea rows={2} value={med.notes} onChange={(e) => setMed({ ...med, notes: e.target.value })} />
        </div>
        <Button
          onClick={() => {
            updateMedical(gymId, memberId, med);
            toast.success("Medical info saved");
          }}
        >
          Save medical info
        </Button>
      </CardContent>
    </Card>
  );
}

function ExtendDialog({
  gymId,
  memberId,
  plans,
}: {
  gymId: string;
  memberId: string;
  plans: any[];
}) {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [upi, setUpi] = useState(0);
  const [cash, setCash] = useState(0);
  const total = method === "split" ? upi + cash : method === "upi" ? upi : cash;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <RefreshCw className="h-4 w-4 mr-1" /> Extend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Extend membership</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.durationDays}d · ₹{p.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment method</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
              className="grid grid-cols-3 gap-2 mt-1"
            >
              {(["cash", "upi", "split"] as PaymentMethod[]).map((mm) => (
                <Label
                  key={mm}
                  className={`border rounded-md px-3 py-2 cursor-pointer text-center capitalize text-sm ${
                    method === mm ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value={mm} className="sr-only" />
                  {mm === "split" ? "UPI + Cash" : mm}
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(method === "upi" || method === "split") && (
              <div>
                <Label>UPI ₹</Label>
                <Input type="number" value={upi || ""} onChange={(e) => setUpi(+e.target.value)} />
              </div>
            )}
            {(method === "cash" || method === "split") && (
              <div>
                <Label>Cash ₹</Label>
                <Input type="number" value={cash || ""} onChange={(e) => setCash(+e.target.value)} />
              </div>
            )}
          </div>
          <div className="text-sm rounded-md bg-accent/50 p-2 flex justify-between">
            <span>Total</span><b>₹{total}</b>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!planId || total <= 0) return toast.error("Pick a plan and enter amount");
              extendMembership(gymId, memberId, planId, {
                method,
                upiAmount: method === "cash" ? 0 : upi,
                cashAmount: method === "upi" ? 0 : cash,
                total,
                date: new Date().toISOString(),
              });
              toast.success("Membership extended");
              setOpen(false);
            }}
          >
            Extend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
