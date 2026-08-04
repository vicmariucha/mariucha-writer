import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => ({
    intent: search["intent"] === "hire" ? ("hire" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — Elena Marsh, Science Writer" },
      {
        name: "description",
        content:
          "Commission a feature, pitch a collaboration or ask about editorial consulting. Get in touch with science writer Elena Marsh.",
      },
      { property: "og:title", content: "Contact — Elena Marsh, Science Writer" },
      {
        property: "og:description",
        content: "Freelance commissions, collaborations and pitches are welcome.",
      },
    ],
  }),
  component: ContactPage,
});

const socials = [
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Twitter / X", href: "https://x.com" },
  { label: "Substack", href: "https://substack.com" },
  { label: "ORCID", href: "https://orcid.org" },
];

function ContactPage() {
  const { intent } = Route.useSearch();
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-20">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-5 font-display text-[2.4rem] leading-[1.08] sm:text-5xl">
            {intent === "hire" ? "Let's talk about your commission." : "Say hello."}
          </h1>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Freelance commissions, collaborations, speaking invitations and pitches are all very
            welcome. I reply to every genuine message, usually within two working days.
          </p>

          <div className="mt-10 border-t border-border pt-6">
            <p className="eyebrow">Direct</p>
            <a
              href="mailto:hello@elenamarsh.com"
              className="link-underline mt-3 inline-flex items-center gap-2 font-display text-xl text-terracotta sm:text-2xl"
            >
              <Mail className="h-5 w-5" />
              hello@elenamarsh.com
            </a>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="eyebrow">Elsewhere</p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border bg-card p-6 shadow-soft sm:p-10">
          {sent ? (
            <div className="animate-scale-in flex min-h-[26rem] flex-col items-center justify-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-accent/40 text-accent">
                <Check className="animate-fade-in h-7 w-7" />
              </span>
              <h2 className="mt-6 font-display text-3xl">Message sent</h2>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Thank you for reaching out — I'll get back to you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="link-underline mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="animate-fade-in space-y-6">
              <Field label="Name" name="name" placeholder="Your name" />
              <Field label="Email" name="email" type="email" placeholder="you@outlet.com" />
              <Field
                label="Subject"
                name="subject"
                placeholder="Commission, pitch, collaboration…"
                defaultValue={intent === "hire" ? "Freelance commission" : undefined}
              />
              <div>
                <label
                  htmlFor="message"
                  className="eyebrow mb-2 block"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell me a little about the story or project."
                  className="w-full resize-none border-b border-border bg-transparent pb-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-foreground py-3.5 text-sm text-background transition-all duration-300 hover:shadow-elevate"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
      />
    </div>
  );
}
