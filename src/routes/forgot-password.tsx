import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { requestOtp, verifyOtpAndReset } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [gymId, setGymId] = useState("");
  const [otp, setOtp] = useState("");
  const [shownOtp, setShownOtp] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-subtle)" }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>We'll send an OTP to your registered email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "request" ? (
            <>
              <div className="space-y-2">
                <Label>Gym ID</Label>
                <Input value={gymId} onChange={(e) => setGymId(e.target.value.toUpperCase())} />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  const r = requestOtp(gymId);
                  if (!r.ok) return toast.error(r.error);
                  setShownOtp(r.otp);
                  setEmail(r.email);
                  setStep("reset");
                  toast.success(`OTP sent to ${r.email}`);
                }}
              >
                <Mail className="h-4 w-4 mr-2" /> Send OTP
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md border bg-accent/50 p-3 text-sm">
                <div className="text-muted-foreground">Demo mode — OTP for <b>{email}</b>:</div>
                <div className="font-mono text-lg font-bold text-primary">{shownOtp}</div>
              </div>
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (!pwd) return toast.error("Enter a new password");
                  if (verifyOtpAndReset(gymId, otp, pwd)) {
                    toast.success("Password updated");
                    navigate({ to: "/login" });
                  } else toast.error("Invalid OTP");
                }}
              >
                Reset password
              </Button>
            </>
          )}
          <div className="text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">Back to login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
