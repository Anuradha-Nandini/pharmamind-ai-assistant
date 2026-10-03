import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signupUser } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Workspace — PharmaMind AI" },
      { name: "description", content: "Create a free PharmaMind AI clinical workspace." },
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
  const [success, setSuccess] = useState("");

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr.trim());
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!fullName.trim()) {
      setError("Please enter your full name & credentials.");
      return;
    }
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setError("Invalid Email Format. Please enter a valid work email address (e.g. name@hospital.org or user@domain.com).");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await signupUser(fullName.trim(), trimmedEmail, password, role);
      setLoading(false);

      if (res.error) {
        setError(res.error);
        return;
      }

      // Construct verified session
      const userSession = {
        name: fullName.trim(),
        email: trimmedEmail,
        role: role,
        token: res.token || "jwt_sec_token_" + Date.now(),
        isVerified: true,
        loggedInAt: new Date().toISOString(),
      };

      // Save session to localStorage & update Navbar profile badge
      localStorage.setItem("pharmamind_user_session", JSON.stringify(userSession));
      window.dispatchEvent(new Event("pharmamind_auth_change"));

      setSuccess("Account registered & verified! Launching workspace...");

      setTimeout(() => {
        navigate({ to: "/ai-assistant" });
      }, 500);
    } catch {
      setLoading(false);
      setError("Registration failed. Please check your network connection.");
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
              Register for verified clinical access.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-teal/40 bg-teal-soft/30 text-accent-foreground text-xs">
                <CheckCircle2 className="h-4 w-4 text-teal" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSignup}>
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
                    placeholder="pharmacist@hospital.org"
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
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Enter Workspace</span>
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
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-teal hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
