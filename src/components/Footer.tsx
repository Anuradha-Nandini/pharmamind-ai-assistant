import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/Navbar";

const columns = [
  {
    title: "Product",
    links: [
      { to: "/ai-assistant", label: "AI Assistant" },
      { to: "/medicines", label: "Medicines" },
      { to: "/interactions", label: "Interactions" },
      { to: "/knowledge-base", label: "Knowledge Base" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/login", label: "Login" },
      { to: "/signup", label: "Sign Up" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Generative AI assistant and knowledge base for pharmaceutical teams —
            drug information, interaction checks and clinical literature in one
            trusted workspace.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-teal"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} PharmaMind AI. All rights reserved.</p>
          <p>For informational use only — not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
