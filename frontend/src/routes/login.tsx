import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Lock, Mail, UserCheck, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { sendOtp, verifyOtp, loginUser } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login & OTP Verification — PharmaMind AI" },
      { name: "description", content: "Sign in to your PharmaMind AI workspace with email OTP verification." },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("anuradha@pharmamind.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(email, password);
      setLoading(false);

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }

      // Open 6-digit OTP modal
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

      // Save user session in localStorage
      const sessionData = {
        name: res.user?.name || (email.split("@")[0] ?? "user").toUpperCase(),
        email: email,
        role: res.user?.role || "Clinical Pharmacist",
        token: res.token || "jwt_token_" + Date.now(),
        isVerified: true,
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem("pharmamind_user_session", JSON.stringify(sessionData));
      setShowOtpModal(false);

      // Redirect to AI Assistant workspace
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
            <CardTitle className="mt-3 text-2xl font-bold text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm">
              Sign in with 2FA Email OTP Verification.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleInitialLogin}>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Password
                  </Label>
                  <span className="text-[11px] text-teal cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                    <span>Send Email OTP Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to PharmaMind AI?{" "}
              <Link to="/signup" className="font-semibold text-teal hover:underline">
                Create a free workspace
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
            <DialogTitle className="text-xl font-bold text-foreground mt-2">Enter Verification Code</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              We sent a 6-digit One-Time Password (OTP) to <strong className="text-foreground">{email}</strong>
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
              {otpLoading ? "Verifying OTP..." : "Verify OTP & Enter Workspace"}
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
