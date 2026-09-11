import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — PharmaMind AI" },
      { name: "description", content: "Sign in to your PharmaMind AI pharmaceutical knowledge workspace." },
      { property: "og:title", content: "Login — PharmaMind AI" },
      { property: "og:description", content: "Sign in to your PharmaMind AI workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-20">
        <Card className="rounded-3xl shadow-lift">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to continue to your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" placeholder="you@hospital.org" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to PharmaMind AI?{" "}
              <Link to="/signup" className="font-medium text-teal hover:underline">
                Create an account
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Interface preview — sign-in is not connected yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
