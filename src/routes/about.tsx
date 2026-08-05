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
          <div className="aspect-4/5 overflow-hidden rounded-2xl border border-border bg-linear-to-br from-terracotta/15 to-cobalt/15">
            <img
              src={authorPhoto.url}
              alt="Portrait of Victória Mariucha, computer engineer and writer"
              className="h-full w-full rounded-2xl object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
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
              I'm Vic Mariucha – a computer engineer and developer based in Sorocaba, Brazil. I
              spend my working hours building software and my free time reading and writing about
              things I will never be paid to understand: dark matter, cell regeneration, how long we
              have until the environment is furious with us, or why my compiler is angry at me
              specifically.
            </p>
            <p>
              Somewhere along the way, I realized I enjoy explaining this stuff more than almost
              anything else. Engineering taught me to break a system down until it makes sense.
              Writing is the exact same job, just with better metaphors and more room for
              creativity.
            </p>
            <p>
              Proudly, writing and science have been part of my life forever. I started my first
              blog when I was 11 (
              <a href="#" className="link-underline text-cobalt">
                check it out here
              </a>
              ), and I loved transforming ideas into text even before that. My most special project,
              aSCIENCEble, was founded alongside a group of incredible people to democratize science
              and make it accessible to anyone curious enough to learn. While it is currently on
              pause with no scheduled return, you can still explore the old content{" "}
              <a href="#" className="link-underline text-cobalt">
                here
              </a>{" "}
              (heads up: it is all in Portuguese).
            </p>
            <p>
              My writing covers science in all its forms. If it smells like real science – not
              pseudo-scientific nonsense – I am in. The tone is friendly, the facts are checked
              twice, and there is usually at least one joke (which I consider a professional
              standard, not a personality flaw). Whether you are 7 or 92 years old, hold two PhDs,
              or didn't finish high school, I will make sure you can follow along.
            </p>
            <p className="inline-flex items-start gap-2">
              <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber" />
              <span>
                Editorial disclosure: I love a dash. Long ones, short ones, ones that hold a
                sentence together with pure confidence – and no, an AI did not put them there. I was
                using em-dashes back when I could barely write my full name, and I refuse to give up
                my favorite punctuation just because a language model developed the same taste.
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
