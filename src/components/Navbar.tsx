import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Pill, UserCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/ai-assistant", label: "AI Assistant" },
  { to: "/medicines", label: "Medicines" },
  { to: "/interactions", label: "Interactions" },
  { to: "/knowledge-base", label: "Knowledge Base" },
  { to: "/about", label: "About" },
] as const;

export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Pill className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Pharma<span className="text-teal">Mind</span> AI
      </span>
    </Link>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userSession, setUserSession] = useState<{ name: string; email: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pharmamind_user_session");
      if (stored) {
        setUserSession(JSON.parse(stored));
      }
    } catch {
      setUserSession(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pharmamind_user_session");
    setUserSession(null);
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {userSession ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal-soft/80 px-3 py-1 text-xs font-semibold text-accent-foreground">
                <UserCheck className="h-3.5 w-3.5 text-teal" />
                {userSession.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {userSession ? (
                <Button variant="outline" size="sm" onClick={handleLogout} className="col-span-2">
                  Sign Out ({userSession.name})
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
