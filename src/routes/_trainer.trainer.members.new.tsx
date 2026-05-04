import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useGym } from "@/lib/useStore";
import { addMember } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import type { PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_trainer/trainer/members/new")({
  component: TrainerNewMember,
});

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function TrainerNewMember() {
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

  const plan = gym.plans.find((p) => p.id === planId);
  const total =
    method === "split"
      ? upiAmount + cashAmount
      : method === "upi"
      ? upiAmount
      : cashAmount;

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!name || !phone || !bloodGroup || !planId)
      return toast.error("Fill all required fields");
    if (total <= 0) return toast.error("Enter the payment amount");
    const m = addMember(gym.gymId, {
      name,
      phone,
      emergencyContact: emergency || undefined,
      photo,
      bloodGroup,
      planId,
      payment: {
        method,
        upiAmount: method === "cash" ? 0 : upiAmount,
        cashAmount: method === "upi" ? 0 : cashAmount,
        total,
        date: new Date().toISOString(),
      },
    });
    if (!m) return toast.error("Could not add member");
    toast.success("Member added! Add medical info next.");
    navigate({ to: "/trainer/members/$id", params: { id: m.id } });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">New member</h1>
        <p className="text-sm text-muted-foreground">Register a new gym member</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Personal info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-accent overflow-hidden flex items-center justify-center">
              {photo ? (
                <img src={photo} className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <Label className="cursor-pointer">
              <span className="inline-flex items-center px-3 py-2 rounded-md border bg-background hover:bg-accent text-sm">
                Upload photo
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </Label>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency contact</Label>
              <Input value={emergency} onChange={(e) => setEmergency(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Blood group *</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BLOOD.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
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
                {gym.plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.durationDays}d · ₹{p.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {plan && (
              <p className="text-xs text-muted-foreground">Suggested price: ₹{plan.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment method *</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
              className="grid grid-cols-3 gap-2"
            >
              {(["cash", "upi", "split"] as PaymentMethod[]).map((m) => (
                <Label
                  key={m}
                  className={`border rounded-md px-3 py-2 cursor-pointer text-center capitalize ${
                    method === m ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value={m} className="sr-only" />
                  {m === "split" ? "UPI + Cash" : m}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {(method === "upi" || method === "split") && (
              <div className="space-y-1.5">
                <Label>UPI amount ₹</Label>
                <Input
                  type="number"
                  value={upiAmount || ""}
                  onChange={(e) => setUpiAmount(+e.target.value)}
                />
              </div>
            )}
            {(method === "cash" || method === "split") && (
              <div className="space-y-1.5">
                <Label>Cash amount ₹</Label>
                <Input
                  type="number"
                  value={cashAmount || ""}
                  onChange={(e) => setCashAmount(+e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="rounded-md bg-accent/50 p-3 text-sm flex justify-between">
            <span className="text-muted-foreground">Total received</span>
            <span className="font-bold">₹{total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate({ to: "/trainer/members" })}>
          Cancel
        </Button>
        <Button onClick={submit}>Register member</Button>
      </div>
    </div>
  );
}
