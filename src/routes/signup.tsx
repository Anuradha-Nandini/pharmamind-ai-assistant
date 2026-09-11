import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — PharmaMind AI" },
      { name: "description", content: "Create a free PharmaMind AI workspace for AI-assisted drug information and interaction checks." },
      { property: "og:title", content: "Create Account — PharmaMind AI" },
      { property: "og:description", content: "Create a free PharmaMind AI workspace." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-20">
        <Card className="rounded-3xl shadow-lift">
          <CardHeader>
            <CardTitle className="text-2xl">Create your workspace</CardTitle>
            <CardDescription>Free while PharmaMind AI is in preview.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Dr. Anuradha Nandini" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" placeholder="you@hospital.org" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="At least 8 characters" />
              </div>
              <Button type="submit" className="w-full">Create account</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-teal hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Interface preview — registration is not connected yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
