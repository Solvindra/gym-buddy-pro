import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addMember } from "@/lib/store";
import { canAddMember, FREE_MEMBER_LIMIT, isPro } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, Crown } from "lucide-react";
import { toast } from "sonner";
import type { PaymentMethod } from "@/lib/types";
import { compressPhoto } from "@/lib/photo";

export const Route = createFileRoute("/_owner/members/new")({
  component: NewMember,
});

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function NewMember() {
  const navigate = useNavigate();
  const session = useSession();
  const gym = useGym(session?.gymId);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency, setEmergency] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [planId, setPlanId] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [upiAmount, setUpiAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);

  if (!gym) return null;
  const memberLimitReached = !canAddMember(gym);
  const plan = gym.plans.find((p) => p.id === planId);
  const total = method === "split" ? upiAmount + cashAmount : method === "upi" ? upiAmount : cashAmount;

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const compressed = await compressPhoto(f);
      setPhoto(compressed);
    } catch {
      toast.error("Could not load photo");
    }
  };

  const submit = () => {
    if (!name || !phone || !bloodGroup || !planId) return toast.error("Fill all required fields");
    if (total <= 0) return toast.error("Enter the payment amount");
    const m = addMember(gym.gymId, {
      name, phone, emergencyContact: emergency || undefined, photo, bloodGroup, planId,
      payment: { method, upiAmount: method === "cash" ? 0 : upiAmount, cashAmount: method === "upi" ? 0 : cashAmount, total, date: new Date().toISOString() },
    });
    if (!m) return toast.error("Could not add member");
    toast.success("Member added! Add medical info next.");
    navigate({ to: "/members/$id", params: { id: m.id } });
  };

  if (memberLimitReached) {
    return (
      <div className="max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold">New member</h1>
          <p className="text-sm text-muted-foreground">Register a new member</p>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto">
            <Crown className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Member limit reached</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your Free plan allows up to <strong>{FREE_MEMBER_LIMIT} members</strong>. You currently have <strong>{gym.members.length}</strong>.
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link to="/subscription"><Crown className="h-4 w-4 mr-2" /> Upgrade to Pro — Unlimited members</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">New member</h1>
        <p className="text-sm text-muted-foreground">Register a new member {!isPro(gym) && `(${gym.members.length}/${FREE_MEMBER_LIMIT} used)`}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Personal info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-accent overflow-hidden flex items-center justify-center">
              {photo ? <img src={photo} className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
            </div>
            <Label className="cursor-pointer">
              <span className="inline-flex items-center px-3 py-2 rounded-md border bg-background hover:bg-accent text-sm">Upload photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </Label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Full name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Emergency contact</Label><Input value={emergency} onChange={(e) => setEmergency(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Blood group *</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{BLOOD.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Membership</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plan *</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
              <SelectContent>
                {gym.plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.durationDays}d · ₹{p.price}</SelectItem>)}
              </SelectContent>
            </Select>
            {plan && <p className="text-xs text-muted-foreground">Suggested price: ₹{plan.price}</p>}
          </div>

          <div className="space-y-2">
            <Label>Payment method *</Label>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="grid grid-cols-3 gap-2">
              {(["cash","upi","split"] as PaymentMethod[]).map((m) => (
                <Label key={m} className={`border rounded-md px-3 py-2 cursor-pointer text-center capitalize ${method === m ? "border-primary bg-primary/5" : ""}`}>
                  <RadioGroupItem value={m} className="sr-only" /> {m === "split" ? "UPI + Cash" : m}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {(method === "upi" || method === "split") && (
              <div className="space-y-1.5"><Label>UPI amount ₹</Label><Input type="number" value={upiAmount || ""} onChange={(e) => setUpiAmount(+e.target.value)} /></div>
            )}
            {(method === "cash" || method === "split") && (
              <div className="space-y-1.5"><Label>Cash amount ₹</Label><Input type="number" value={cashAmount || ""} onChange={(e) => setCashAmount(+e.target.value)} /></div>
            )}
          </div>
          <div className="rounded-md bg-accent/50 p-3 text-sm flex justify-between">
            <span className="text-muted-foreground">Total received</span>
            <span className="font-bold">₹{total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate({ to: "/members" })}>Cancel</Button>
        <Button onClick={submit}>Register member</Button>
      </div>
    </div>
  );
}
