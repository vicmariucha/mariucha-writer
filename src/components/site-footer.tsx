import { Link } from "@tanstack/react-router";

const socials = [
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X", href: "https://x.com" },
  { label: "Substack", href: "https://substack.com" },
  { label: "ORCID", href: "https://orcid.org" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl">Elena Marsh</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Longform science journalism, features and editorial consulting — from the lab bench to
            the page.
          </p>
          <a
            href="mailto:hello@elenamarsh.com"
            className="link-underline mt-4 inline-block text-sm text-accent"
          >
            hello@elenamarsh.com
          </a>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
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
            © {new Date().getFullYear()} Elena Marsh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
