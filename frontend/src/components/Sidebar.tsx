import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Pill,
  Shuffle,
  BookOpen,
  Home,
  Info,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import { Brand } from "@/components/Navbar";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/interactions", label: "Interactions", icon: Shuffle },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/about", label: "About", icon: Info },
  { to: "/login", label: "Login", icon: LogIn },
  { to: "/signup", label: "Sign Up", icon: UserPlus },
] as const;

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeProps={{
            className: "bg-primary text-primary-foreground hover:bg-primary",
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <item.icon className="h-4.5 w-4.5 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-b border-border bg-sidebar lg:hidden">
          <Nav onNavigate={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col",
          className,
        )}
      >
        <div className="px-5 py-5">
          <Brand />
        </div>
        <Nav />
        <div className="mt-auto m-3 rounded-2xl bg-teal-soft p-4">
          <p className="text-sm font-semibold text-foreground">PharmaMind Workspace</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generative AI and clinical knowledge platform for pharmaceutical teams.
          </p>
        </div>
      </aside>
    </>
  );
}
