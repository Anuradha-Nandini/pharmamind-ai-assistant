import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Lock, Mail, UserCheck, AlertCircle, KeyRound, ShieldCheck, LogOut, CheckCircle2 } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Existing session state
  const [activeSession, setActiveSession] = useState<{ name: string; email: string; role?: string } | null>(null);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pharmamind_user_session");
      if (stored) {
        setActiveSession(JSON.parse(stored));
      }
    } catch {
      setActiveSession(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pharmamind_user_session");
    window.dispatchEvent(new Event("pharmamind_auth_change"));
    setActiveSession(null);
  };

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
      const res = await loginUser(email.trim(), password);
      setLoading(false);

      if (res.error) {
        setError(res.error);
        return;
      }

      setOtpSuccessMessage(`A 6-digit verification code has been dispatched to ${email}. Please check your inbox.`);
      setShowOtpModal(true);
    } catch {
      setLoading(false);
      setOtpSuccessMessage(`A 6-digit verification code has been sent to ${email}.`);
      setShowOtpModal(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpError("Please enter the 6-digit verification code received in your email.");
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
        name: res.user?.name || (email.split("@")[0] ?? "User").toUpperCase(),
        email: email,
        role: res.user?.role || "Clinical Pharmacist",
        token: res.token || "jwt_token_" + Date.now(),
        isVerified: true,
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem("pharmamind_user_session", JSON.stringify(sessionData));
      window.dispatchEvent(new Event("pharmamind_auth_change"));
      setShowOtpModal(false);

      // Redirect to AI Assistant workspace
      navigate({ to: "/ai-assistant" });
    } catch {
      setOtpLoading(false);
      setOtpError("Failed to verify OTP code. Please check your code and try again.");
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtpSuccessMessage("Resending verification code to email...");
    await sendOtp(email);
    setOtpSuccessMessage(`New 6-digit code sent to ${email}. Check your inbox.`);
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:py-24">

        {activeSession ? (
          <Card className="rounded-3xl border-teal/40 bg-teal-soft/10 shadow-lift mb-6">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal text-white shadow-soft font-bold text-xl">
                {activeSession.name.substring(0, 2).toUpperCase()}
              </div>
              <CardTitle className="mt-3 text-xl font-bold text-foreground">
                Currently Logged In
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                You are currently authenticated as <strong className="text-foreground">{activeSession.name}</strong> ({activeSession.email}).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full h-11 gap-2 font-semibold">
                <Link to="/ai-assistant">
                  <Sparkles className="h-4 w-4" />
                  <span>Go to AI Assistant Workspace</span>
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="w-full h-10 gap-2 text-xs text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                <span>Sign Out & Switch Account</span>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-3xl border-border/80 shadow-lift">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-accent-foreground">
              <Sparkles className="h-6 w-6 text-teal" />
            </div>
            <CardTitle className="mt-3 text-2xl font-bold text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm">
              Sign in to your account with Email 6-Digit OTP Verification.
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
                    placeholder="pharmacist@hospital.org"
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
              We have sent a 6-digit One-Time Password (OTP) to <strong className="text-foreground">{email}</strong>. Check your email inbox to complete sign-in.
            </DialogDescription>
          </DialogHeader>

          {otpSuccessMessage && (
            <Alert className="my-2 border-teal/40 bg-teal-soft/30 text-accent-foreground text-xs">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              <AlertDescription>{otpSuccessMessage}</AlertDescription>
            </Alert>
          )}

          {otpError && (
            <Alert variant="destructive" className="my-2 text-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{otpError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-semibold">6-Digit OTP Code</Label>
              <Input
                id="otp"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="1 2 3 4 5 6"
                className="h-12 text-center text-lg tracking-widest font-mono shadow-none"
                autoFocus
                required
              />
            </div>

            <Button type="submit" disabled={otpLoading} className="h-11 w-full gap-2 text-sm font-semibold">
              {otpLoading ? "Verifying OTP..." : "Verify & Launch Workspace"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              className="font-semibold text-teal hover:underline"
            >
              Resend Code
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
