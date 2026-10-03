import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Pill, User, LogOut, History, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/ai-assistant", label: "AI Assistant" },
  { to: "/medicines", label: "Medicines" },
  { to: "/interactions", label: "Interactions" },
  { to: "/knowledge-base", label: "Knowledge Base" },
  { to: "/about", label: "About" },
] as const;

export interface UserSession {
  name: string;
  email: string;
  role?: string;
  token?: string;
  isVerified?: boolean;
}

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
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const navigate = useNavigate();

  const loadUserSession = () => {
    try {
      const stored = localStorage.getItem("pharmamind_user_session");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserSession();

    const handleAuthChange = () => loadUserSession();
    window.addEventListener("pharmamind_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("pharmamind_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pharmamind_user_session");
    window.dispatchEvent(new Event("pharmamind_auth_change"));
    setUser(null);
    navigate({ to: "/login" });
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      const p1 = parts[0];
      const p2 = parts[1];
      if (p1 && p2) {
        return (p1.charAt(0) + p2.charAt(0)).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "PM";
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

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 gap-2.5 rounded-full border-teal/40 bg-teal-soft/20 px-3 hover:bg-teal-soft/40">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal font-bold text-xs text-white">
                    {getUserInitials(user.name, user.email)}
                  </div>
                  <div className="text-left leading-tight hidden xl:block">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{user.role || "Verified User"}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-lift">
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {user.name}
                      <ShieldCheck className="h-4 w-4 text-teal inline" />
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-flex w-fit items-center rounded-full bg-teal-soft/80 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                      {user.role || "Clinical Pharmacist"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                  <Link to="/ai-assistant" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal" />
                    <span>AI Assistant Workspace</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-destructive focus:text-destructive py-2.5">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

            {user ? (
              <div className="mt-4 rounded-2xl border border-teal/30 bg-teal-soft/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white font-bold">
                    {getUserInitials(user.name, user.email)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Button asChild size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => setOpen(false)}>
                    <Link to="/ai-assistant">
                      <Sparkles className="h-4 w-4 text-teal" />
                      <span>AI Assistant Workspace</span>
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" className="w-full justify-start gap-2" onClick={() => { setOpen(false); handleLogout(); }}>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

