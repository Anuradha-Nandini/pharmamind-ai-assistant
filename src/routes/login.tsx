import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ShieldCheck, ArrowRight, Lock, Mail, UserCheck, AlertCircle } from "lucide-react";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — PharmaMind AI" },
      { name: "description", content: "Sign in to your PharmaMind AI pharmaceutical knowledge workspace." },
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
  const [success, setSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
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

    setTimeout(() => {
      // Create session in localStorage
      const userSession = {
        name: (email.split("@")[0] ?? "user").replace(".", " ").toUpperCase() || "Dr. Clinical User",
        email: email,
        role: "Clinical Pharmacist",
        token: "demo_jwt_token_" + Date.now(),
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem("pharmamind_user_session", JSON.stringify(userSession));
      setLoading(false);
      setSuccess(true);

      // Redirect to AI Assistant after 800ms
      setTimeout(() => {
        navigate({ to: "/ai-assistant" });
      }, 800);
    }, 1000);
  };

  const handleQuickDemo = () => {
    setEmail("dr.anuradha@pharmamind.ai");
    setPassword("demoPass2026");
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
              Sign in to access your PharmaMind AI workspace.
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

            {success && (
              <Alert className="mb-4 border-teal/40 bg-teal-soft/50 text-accent-foreground">
                <UserCheck className="h-4 w-4 text-teal" />
                <AlertTitle>Login Successful</AlertTitle>
                <AlertDescription>Redirecting to AI Clinical Assistant...</AlertDescription>
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

              <Button type="submit" disabled={loading || success} className="h-11 w-full gap-2 text-sm font-semibold">
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign in to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 rounded-xl border border-teal/20 bg-teal-soft/30 p-3 text-center text-xs">
              <span className="text-muted-foreground">Demo Credentials Pre-filled. </span>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="font-semibold text-accent-foreground hover:underline ml-1"
              >
                Use Demo Login
              </button>
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
