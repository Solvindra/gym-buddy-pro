import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { loginOwner, loginTrainer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [ownerGymId, setOwnerGymId] = useState("");
  const [ownerPwd, setOwnerPwd] = useState("");
  const [ownerKeep, setOwnerKeep] = useState(true);

  const [tTrainerId, setTTrainerId] = useState("");
  const [tPwd, setTPwd] = useState("");
  const [tKeep, setTKeep] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-subtle)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-3 text-primary-foreground shadow-md" style={{ background: "var(--gradient-primary)" }}>
            <Dumbbell className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FitTrack Gym Manager</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your gym</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Choose your role to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="owner">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="owner">Owner</TabsTrigger>
                <TabsTrigger value="trainer">Trainer</TabsTrigger>
              </TabsList>

              <TabsContent value="owner" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Gym ID</Label>
                  <Input value={ownerGymId} onChange={(e) => setOwnerGymId(e.target.value.toUpperCase())} placeholder="e.g. RS96I" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={ownerPwd} onChange={(e) => setOwnerPwd(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="owner-keep"
                    checked={ownerKeep}
                    onCheckedChange={(v) => setOwnerKeep(!!v)}
                  />
                  <label htmlFor="owner-keep" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Keep me logged in
                  </label>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (loginOwner(ownerGymId, ownerPwd, ownerKeep)) {
                      toast.success("Welcome back!");
                      navigate({ to: "/dashboard" });
                    } else toast.error("Invalid Gym ID or password");
                  }}
                >
                  Sign in
                </Button>
                <div className="flex justify-between text-sm">
                  <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
                  <Link to="/signup" className="text-primary hover:underline">Create gym</Link>
                </div>
              </TabsContent>

              <TabsContent value="trainer" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Trainer ID</Label>
                  <Input
                    value={tTrainerId}
                    onChange={(e) => setTTrainerId(e.target.value.toUpperCase())}
                    placeholder="e.g. TRJORS96"
                  />
                  <p className="text-xs text-muted-foreground">Your Trainer ID was shared by your gym owner when your account was created.</p>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={tPwd} onChange={(e) => setTPwd(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="trainer-keep"
                    checked={tKeep}
                    onCheckedChange={(v) => setTKeep(!!v)}
                  />
                  <label htmlFor="trainer-keep" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Keep me logged in
                  </label>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (loginTrainer(tTrainerId, tPwd, tKeep)) {
                      toast.success("Welcome!");
                      navigate({ to: "/trainer/attendance" });
                    } else toast.error("Invalid Trainer ID or password");
                  }}
                >
                  Sign in as trainer
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
