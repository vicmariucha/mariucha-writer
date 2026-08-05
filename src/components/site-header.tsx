import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/about", label: "About" },
  { to: "/articles", label: "Articles" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <span className="block h-1 bg-linear-to-r from-terracotta via-amber to-cobalt" />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
          <span className="block truncate font-display text-lg tracking-tight sm:text-xl">
            Vic Mariucha
          </span>
          <span className="eyebrow block">Writer · Computer Engineer · Developer</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative pb-1 text-sm text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-linear-to-r after:from-terracotta after:via-amber after:to-cobalt after:transition-transform after:duration-300 hover:text-terracotta hover:after:scale-x-100"
              activeProps={{ className: "text-foreground after:scale-x-100" }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/contact"
            search={{ intent: "hire" }}
            className="rounded-full border border-terracotta px-5 py-2 text-xs uppercase tracking-[0.18em] text-terracotta transition-all duration-300 hover:bg-terracotta hover:text-background hover:shadow-elevate"
          >
            Hire Me
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 p-1 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="animate-fade-in border-t border-border bg-background px-5 pb-6 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-border/60 py-3 font-display text-2xl text-muted-foreground"
              activeProps={{ className: "text-terracotta" }}
            >
              {l.label}
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta opacity-0 data-[active]:opacity-100" />
            </Link>
          ))}

          <Link
            to="/contact"
            search={{ intent: "hire" }}
            onClick={() => setOpen(false)}
            className="mt-5 inline-block rounded-full border border-terracotta px-5 py-2 text-xs uppercase tracking-[0.18em] text-terracotta"
          >
            Hire Me
          </Link>
        </nav>
      )}
    </header>
  );
}
