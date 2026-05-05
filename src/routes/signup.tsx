import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signupGym, generateGymId } from "@/lib/store";
import type { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Trash2, Plus, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { CITIES_BY_STATE } from "@/lib/india-cities";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const defaultPlans: Plan[] = [
  { id: crypto.randomUUID?.() || "p1", name: "Monthly", durationDays: 30, price: 1500 },
  { id: crypto.randomUUID?.() || "p2", name: "Quarterly", durationDays: 90, price: 4000 },
];

const INDIAN_STATES = Object.keys(CITIES_BY_STATE).sort();

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    gymName: "",
    ownerName: "",
    ownerSurname: "",
    ownerPhone: "",
    ownerEmail: "",
    city: "",
    state: "",
    password: "",
  });
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [newPlan, setNewPlan] = useState({ name: "", durationDays: 30, price: 0 });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const previewId = generateGymId({
    ownerName: form.ownerName || "X",
    ownerSurname: form.ownerSurname || "X",
    ownerPhone: form.ownerPhone || "0",
    city: form.city || "X",
  });

  const citiesForState = form.state ? (CITIES_BY_STATE[form.state] ?? []) : [];

  const handleStateChange = (val: string) => {
    setForm((f) => ({ ...f, state: val, city: "" }));
  };

  const submit = () => {
    if (!form.gymName || !form.ownerName || !form.ownerSurname || !form.ownerPhone || !form.ownerEmail || !form.city || !form.state || !form.password) {
      toast.error("Fill all required fields");
      return;
    }
    if (plans.length === 0) {
      toast.error("Add at least one membership plan");
      return;
    }
    const r = signupGym({ ...form, plans });
    if (!r.ok) return toast.error(r.error);
    toast.success(`Gym created! Your ID: ${r.gymId}`);
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen p-4 py-10" style={{ background: "var(--gradient-subtle)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl items-center justify-center mb-3 text-primary-foreground shadow" style={{ background: "var(--gradient-primary)" }}>
            <Dumbbell className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Create your gym</h1>
          <p className="text-sm text-muted-foreground">Set up your gym profile and plans</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gym & owner details</CardTitle>
            <CardDescription>Your Gym ID will be auto-generated from these</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Gym name"><Input value={form.gymName} onChange={upd("gymName")} /></Field>
              <Field label="Owner first name"><Input value={form.ownerName} onChange={upd("ownerName")} /></Field>
              <Field label="Owner surname"><Input value={form.ownerSurname} onChange={upd("ownerSurname")} /></Field>
              <Field label="Owner phone"><Input value={form.ownerPhone} onChange={upd("ownerPhone")} /></Field>
              <Field label="Owner email (for OTP)"><Input type="email" value={form.ownerEmail} onChange={upd("ownerEmail")} /></Field>

              {/* State combobox */}
              <Field label="State">
                <Combobox
                  options={INDIAN_STATES}
                  value={form.state}
                  onChange={handleStateChange}
                  placeholder="Type or select state..."
                />
              </Field>

              {/* City combobox — depends on state */}
              <Field label="City">
                <Combobox
                  options={citiesForState}
                  value={form.city}
                  onChange={(val) => setForm((f) => ({ ...f, city: val }))}
                  placeholder="Type or select city..."
                  disabled={!form.state}
                />
              </Field>

              <Field label="Password"><Input type="password" value={form.password} onChange={upd("password")} /></Field>
            </div>

            <div className="rounded-lg border bg-accent/50 p-3 text-sm">
              <span className="text-muted-foreground">Your Gym ID will be:</span>{" "}
              <span className="font-mono font-bold text-primary">{previewId}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Membership plans</CardTitle>
            <CardDescription>Add the plans your gym will offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.durationDays} days · ₹{p.price}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPlans((ps) => ps.filter((x) => x.id !== p.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input placeholder="Plan name" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} />
              <Input type="number" placeholder="Days" value={newPlan.durationDays || ""} onChange={(e) => setNewPlan({ ...newPlan, durationDays: +e.target.value })} />
              <Input type="number" placeholder="Price ₹" value={newPlan.price || ""} onChange={(e) => setNewPlan({ ...newPlan, price: +e.target.value })} />
              <Button
                variant="secondary"
                onClick={() => {
                  if (!newPlan.name || !newPlan.durationDays) return toast.error("Plan name and days required");
                  setPlans((ps) => [...ps, { ...newPlan, id: crypto.randomUUID() }]);
                  setNewPlan({ name: "", durationDays: 30, price: 0 });
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link to="/login" className="text-sm text-muted-foreground hover:underline">Back to login</Link>
          <Button onClick={submit} size="lg">Make Gym ID</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
