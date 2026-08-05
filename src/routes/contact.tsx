import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LocalTime } from "@/components/local-time";
import { DeveloperCTA } from "@/components/developer-cta";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => ({
    intent: search["intent"] === "hire" ? ("hire" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact Victória Mariucha – Let's Work Together" },
      {
        name: "description",
        content:
          "Commissions, collaborations, pitches or just a good science argument. Email vicmariucha@gmail.com – based in Sorocaba, Brazil (UTC−3).",
      },
      { property: "og:title", content: "Contact Victória Mariucha – Let's Work Together" },
      {
        property: "og:description",
        content: "Freelance writing, collaborations and pitches welcome. Sorocaba, Brazil (UTC−3).",
      },
    ],
  }),
  component: ContactPage,
});

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/victoria-mariucha/" },
  { label: "GitHub", href: "https://github.com/vicmariucha" },
  { label: "Substack", href: "https://substack.com/@vicmariucha" },
];

function ContactPage() {
  const { intent } = Route.useSearch();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    if (!payload.name || !/\S+@\S+\.\S+/.test(payload.email) || !payload.message) {
      setError("Please fill in your name, a valid email and a message.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("contact_messages").insert(payload);
    setBusy(false);
    if (err) {
      setError("Something went wrong sending that. Try emailing me directly?");
      return;
    }
    setSent(true);
  }


  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-20">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-5 font-display text-[2.4rem] leading-[1.08] sm:text-5xl">
            {intent === "hire"
              ? "Excellent decision. Let's talk."
              : "Say hi. I promise I reply."}
          </h1>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Freelance commissions, collaborations, developer documentation, speaking invitations,
            pitches, or a strongly worded opinion about which Spider-Man is the best one – all
            welcome. I answer every genuine message, usually within two working days, occasionally
            within two minutes if I'm procrastinating.
          </p>

          <div className="mt-10 rounded-sm border border-border bg-linear-to-br from-terracotta/8 to-amber/8 p-6">
            <p className="eyebrow">Direct</p>
            <a
              href="mailto:vicmariucha@gmail.com"
              className="link-underline mt-3 inline-flex items-center gap-2 font-display text-xl text-terracotta sm:text-2xl"
            >
              <Mail className="h-5 w-5" />
              vicmariucha@gmail.com
            </a>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              Sorocaba, Brazil · <LocalTime suffix="my time zone right now" /> – happily
              overlapping with Europe in the morning and the US all afternoon
            </p>
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
                  className="link-underline text-sm text-muted-foreground transition-colors hover:text-cobalt"
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
              <span className="grid h-16 w-16 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <Check className="animate-fade-in h-7 w-7" />
              </span>
              <h2 className="mt-6 font-display text-3xl">Message sent</h2>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Thank you! It's already on its way to Sorocaba. I'll get back to you shortly –
                probably faster than you expect.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="link-underline mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-terracotta"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="animate-fade-in space-y-6">
              <Field label="Name" name="name" placeholder="Your name" />
              <Field label="Email" name="email" type="email" placeholder="you@company.com" />
              <Field
                label="Subject"
                name="subject"
                placeholder="Commission, pitch, collaboration…"
                defaultValue={intent === "hire" ? "Freelance commission" : undefined}
              />
              <div>
                <label htmlFor="message" className="eyebrow mb-2 block">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell me about the story, the project, or the bug you'd like explained."
                  className="w-full resize-none border-b border-border bg-transparent pb-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-cobalt"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-foreground py-3.5 text-sm text-background transition-all duration-300 hover:bg-terracotta hover:shadow-elevate"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </div>

      <DeveloperCTA />
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
  defaultValue?: string | undefined;
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
        className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-cobalt"
      />
    </div>
  );
}
