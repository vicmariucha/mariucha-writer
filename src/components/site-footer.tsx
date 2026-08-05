import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { LocalTime } from "@/components/local-time";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/victoria-mariucha/" },
  { label: "GitHub", href: "https://github.com/vicmariucha" },
  { label: "Substack", href: "https://substack.com/@vicmariucha" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <span className="mx-auto block h-1 max-w-6xl bg-linear-to-r from-cobalt via-plum to-terracotta" />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl">Victória Mariucha</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Available for work, collaborations and very nerdy conversations.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            Sorocaba, Brazil · <LocalTime suffix="my time zone right now" />
          </p>
          <span className="mt-4 block">
            <a
              href="mailto:vicmariucha@gmail.com"
              className="link-underline inline-block text-sm text-terracotta"
            >
              vicmariucha@gmail.com
            </a>
          </span>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-cobalt"
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Link to="/articles" className="link-underline hover:text-foreground">
              Articles
            </Link>
            <Link to="/about" className="link-underline hover:text-foreground">
              About
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Victória Mariucha. Built with curiosity and stubbornness.
          </p>
        </div>
      </div>
    </footer>
  );
}
