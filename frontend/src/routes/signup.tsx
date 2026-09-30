import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Lock, Mail, User, UserCheck, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { sendOtp, verifyOtp, signupUser } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account & OTP Verification — PharmaMind AI" },
      { name: "description", content: "Create a free PharmaMind AI workspace with email OTP verification." },
    ],
  }),
  component: SignupPage,
});

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Clinical Pharmacist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const handleInitialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await signupUser(fullName.trim(), email.trim(), password, role);
      setLoading(false);

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }

      // Open OTP Verification Modal
      setShowOtpModal(true);
    } catch {
      setLoading(false);
      setShowOtpModal(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit verification code.");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await verifyOtp(email, otpInput.trim());
      setOtpLoading(false);

      if (res.error) {
        setOtpError(res.error);
        return;
      }

      // Save user session to localStorage
      const userSession = {
        name: fullName,
        email: email,
        role: role,
        token: res.token || "jwt_session_" + Date.now(),
        isVerified: true,
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem("pharmamind_user_session", JSON.stringify(userSession));
      setShowOtpModal(false);

      // Redirect to AI Assistant
      navigate({ to: "/ai-assistant" });
    } catch {
      setOtpLoading(false);
      setOtpError("Failed to verify OTP code.");
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    const res = await sendOtp(email);
    if (res.demoOtp) {
      setDemoOtp(res.demoOtp);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:py-24">
        <Card className="rounded-3xl border-border/80 shadow-lift">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-accent-foreground">
              <Sparkles className="h-6 w-6 text-teal" />
            </div>
            <CardTitle className="mt-3 text-2xl font-bold text-foreground">Create your workspace</CardTitle>
            <CardDescription className="text-sm">
              Register & verify via Email 6-Digit OTP.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleInitialSignup}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Full Name & Credentials
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Anuradha Nandini, PharmD"
                    className="pl-9 h-11 text-sm shadow-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Work Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.org"
                    className="pl-9 h-11 text-sm shadow-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-semibold">
                  Professional Specialty
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 text-sm shadow-none">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clinical Pharmacist">Clinical Pharmacist</SelectItem>
                    <SelectItem value="Physician / Clinician">Physician / Clinician</SelectItem>
                    <SelectItem value="Medical Researcher">Medical Researcher</SelectItem>
                    <SelectItem value="Pharmacovigilance Specialist">Pharmacovigilance Specialist</SelectItem>
                    <SelectItem value="Pharmacy Student / Resident">Pharmacy Student / Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pl-9 h-11 text-sm shadow-none"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="h-11 w-full gap-2 text-sm font-semibold">
                {loading ? (
                  <span>Sending Verification Code...</span>
                ) : (
                  <>
                    <span>Create Account & Send OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-teal hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 6-Digit Email OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground mt-2">Verify Email Address</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              We sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>
            </DialogDescription>
          </DialogHeader>

          {otpError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{otpError}</AlertDescription>
            </Alert>
          )}

          {demoOtp && (
            <div className="my-2 rounded-xl border border-teal/30 bg-teal-soft/50 p-3 text-center text-xs text-accent-foreground">
              <span className="font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="h-4 w-4 text-teal" /> Verification OTP Generated:
              </span>
              <p className="mt-1 text-lg font-mono font-bold tracking-widest text-teal">{demoOtp}</p>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-semibold">6-Digit OTP Code</Label>
              <Input
                id="otp"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                className="h-12 text-center text-xl font-mono tracking-widest shadow-none"
                required
              />
            </div>

            <Button type="submit" disabled={otpLoading || otpInput.trim().length !== 6} className="h-11 w-full text-sm font-semibold">
              {otpLoading ? "Verifying..." : "Verify OTP & Activate Account"}
            </Button>
          </form>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Didn't receive code?</span>
            <button type="button" onClick={handleResendOtp} className="font-semibold text-teal hover:underline">
              Resend OTP Code
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
