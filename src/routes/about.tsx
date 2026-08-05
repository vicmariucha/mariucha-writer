import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowRight, MapPin, Sparkles } from "lucide-react";
import authorPhoto from "@/assets/author-photo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Victória Mariucha – Engineer, Developer, Science Nerd" },
      {
        name: "description",
        content:
          "Computer engineer and developer based in Sorocaba, Brazil. I build software, write about science and technology, and defend Spider-Man in any argument.",
      },
      {
        property: "og:title",
        content: "About Victória Mariucha – Engineer, Developer, Science Nerd",
      },
      {
        property: "og:description",
        content:
          "Computer engineer and developer from Sorocaba, Brazil, writing about science, code and friendly neighborhood superheroes.",
      },
    ],
  }),
  component: AboutPage,
});

const credentials = [
  { k: "B.Eng, Computer Engineering", v: "Plus a physics elective I took entirely for fun", c: "border-cobalt/60" },
  { k: "Software Developer", v: "Shipping code that mostly behaves in production", c: "border-accent/60" },
  { k: "Science & Tech Obsessive", v: "Reads papers recreationally. It's a whole thing.", c: "border-amber/70" },
  { k: "Certified Spider-Man Apologist", v: "Will defend the 2002 movie in any technical review", c: "border-terracotta/60" },
];

const expertise = [
  "Software engineering",
  "AI & machine learning explainers",
  "Developer documentation",
  "Space & physics writing",
  "Technical storytelling",
  "Making acronyms make sense",
];

function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-16">
        <div>
          <div className="aspect-4/5 overflow-hidden border border-border bg-linear-to-br from-terracotta/15 to-cobalt/15">
            <img
              src={authorPhoto.url}
              alt="Portrait of Victória Mariucha, computer engineer and writer"
              className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            Sorocaba, São Paulo, Brazil · UTC−3
          </p>
        </div>

        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-5 font-display text-[2.4rem] leading-[1.08] sm:text-5xl">
            Engineer by training, explainer by temperament.
          </h1>
          <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
            <p className="text-foreground">
              I'm Victória – a computer engineer and developer based in Sorocaba, Brazil. I spend my
              working hours building software and my non-working hours reading about things I will
              never be paid to understand: protein folding, orbital mechanics, why my compiler is
              angry at me specifically.
            </p>
            <p>
              Somewhere along the way I realised I enjoy explaining this stuff more than almost
              anything else. Engineering taught me to break a system down until it makes sense.
              Writing is the same job with better metaphors and fewer stack traces.
            </p>
            <p>
              My writing sits where science and technology overlap: AI without the hype, code
              without the gatekeeping, space because it's space. The tone is friendly, the facts are
              checked twice, and there is usually at least one joke – I consider that a professional
              standard, not a personality flaw.
            </p>
            <p>
              Editorial disclosure: I love a dash. Long ones, short ones, ones that hold a sentence
              together with pure confidence – and no, an AI did not put them there. I was doing this
              back when autocomplete could barely finish my name, and I refuse to give up my
              favourite punctuation just because a language model developed the same taste.
            </p>
            <p className="inline-flex items-start gap-2">
              <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber" />
              <span>
                Off the clock: Spider-Man. Comics, films, the physics of web-shooters, the whole
                canon. If your publication needs someone who can cite both a research paper and a
                1963 issue of Amazing Fantasy, hello.
              </span>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {expertise.map((e) => (
              <span
                key={e}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-cobalt/50 hover:text-cobalt"
              >
                {e}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/cv-victoria-mariucha.pdf"
              download
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background transition-all duration-300 hover:bg-cobalt hover:shadow-elevate"
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Download CV
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-terracotta/50 px-6 py-3 text-sm text-terracotta transition-colors duration-300 hover:bg-terracotta/8"
            >
              Work with me
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-24 rounded-sm border border-dashed border-terracotta/40 bg-linear-to-br from-terracotta/8 via-card to-amber/8 p-8 sm:p-12">
        <p className="eyebrow">Bylines</p>
        <p className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
          This space is aggressively, embarrassingly available.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          No logos here yet – which means the first outlet to publish me gets this whole section to
          itself, in a lovely large font, forever. Think of it as ground-floor investment in a
          writer who fact-checks obsessively and hits deadlines out of sheer anxiety.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {["Your Publication Here", "Also Yours", "Still Available"].map((o) => (
            <span
              key={o}
              className="rounded-full border border-dashed border-border px-4 py-2 font-display text-lg text-muted-foreground/70 transition-colors duration-300 hover:border-terracotta hover:text-terracotta"
            >
              {o}
            </span>
          ))}
        </div>
        <Link
          to="/contact"
          search={{ intent: "hire" }}
          className="link-underline mt-8 inline-flex items-center gap-2 text-sm text-terracotta"
        >
          Be the first to publish my work
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-16 border-t border-border pt-10">
        <p className="eyebrow">Credentials (real ones)</p>
        <dl className="mt-6 grid gap-8 sm:grid-cols-2">
          {credentials.map((c) => (
            <div key={c.k} className={`border-l pl-5 ${c.c}`}>
              <dt className="font-display text-xl">{c.k}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{c.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
