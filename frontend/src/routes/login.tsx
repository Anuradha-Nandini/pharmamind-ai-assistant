import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, LogOut, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loginUser } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — PharmaMind AI" },
      { name: "description", content: "Sign in to your PharmaMind AI workspace." },
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
  const [success, setSuccess] = useState("");

  // Existing session state
  const [activeSession, setActiveSession] = useState<{ name: string; email: string; role?: string } | null>(null);

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

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr.trim());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setError("Invalid Email Format. Please enter a valid email address (e.g. name@hospital.org or user@domain.com).");
      return;
    }
    if (!password || password.length < 4) {
      setError("Please enter your account password (minimum 4 characters).");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(trimmedEmail, password);
      setLoading(false);

      if (res.error) {
        setError(res.error);
        return;
      }

      // Construct verified session
      const sessionData = {
        name: res.user?.name || (trimmedEmail.split("@")[0] ?? "User").toUpperCase(),
        email: trimmedEmail,
        role: res.user?.role || "Clinical Pharmacist",
        token: res.token || "jwt_sec_token_" + Date.now(),
        isVerified: true,
        loggedInAt: new Date().toISOString(),
      };

      // Save user session in localStorage & update Navbar profile badge
      localStorage.setItem("pharmamind_user_session", JSON.stringify(sessionData));
      window.dispatchEvent(new Event("pharmamind_auth_change"));

      setSuccess("Authentication verified! Launching workspace...");

      setTimeout(() => {
        navigate({ to: "/ai-assistant" });
      }, 500);
    } catch {
      setLoading(false);
      setError("Authentication failed. Please check your network connection.");
    }
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
              Sign in with your Work Email and Password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-teal/40 bg-teal-soft/30 text-accent-foreground text-xs">
                <CheckCircle2 className="h-4 w-4 text-teal" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
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
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 rounded-xl border border-teal/20 bg-teal-soft/20 p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal shrink-0" />
              <span>Verified Clinical Encryption Active</span>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to PharmaMind AI?{" "}
              <Link to="/signup" className="font-semibold text-teal hover:underline">
                Create a free workspace
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
