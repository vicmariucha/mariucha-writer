import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { LocalTime } from "@/components/local-time";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Victória Mariucha – Science Writer" },
      {
        name: "description",
        content:
          "Computer engineer and developer from Sorocaba, Brazil, writing about science, technology, code and Spider-Man. Available for writing work and collaborations.",
      },
      {
        property: "og:title",
        content: "Victória Mariucha – Science Writer",
      },
      {
        property: "og:description",
        content:
          "Computer engineer and developer from Sorocaba, Brazil, writing about science, technology, code and Spider-Man. Available for writing work and collaborations.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = articles.filter((a) => a.featured);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <p className="eyebrow animate-fade-in inline-flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          Sorocaba, Brazil · <LocalTime suffix="my time zone" />
        </p>
        <h1 className="animate-fade-in mt-6 max-w-4xl font-display text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl">
          I turn complicated science into things people{" "}
          <em className="italic text-terracotta">actually finish reading</em>.
        </h1>
        <p className="animate-fade-in mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Hi, I'm Vic Mariucha – computer engineer, developer, professional over-explainer of
          any topic you can imagine, and, in my free time, an extremely committed Spider-Man fan. I
          write about science, technology, space, environment, and the parts of science that make
          you say "wait, really?"
        </p>
        <div className="animate-fade-in mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/articles"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm text-background transition-all duration-300 hover:bg-terracotta hover:shadow-elevate"
          >
            Read Articles
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            search={{ intent: undefined }}

            className="inline-flex items-center gap-2 rounded-full border border-cobalt/50 px-7 py-3 text-sm text-cobalt transition-all duration-300 hover:bg-cobalt/8"
          >
            Get in Touch
          </Link>
        </div>

        <dl className="mt-20 grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
          {[
            { k: "0", v: "Articles published by a major outlet (yet)", c: "text-terracotta" },
            { k: "∞", v: "Tabs open while researching a single paragraph", c: "text-cobalt" },
            { k: "B.Eng", v: "Computer Engineering", c: "text-accent" },
          ].map((s) => (
            <div key={s.k}>
              <dt className={`font-display text-4xl ${s.c}`}>{s.k}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <h2 className="font-display text-3xl sm:text-4xl">Featured work</h2>
          <Link
            to="/articles"
            className="link-underline text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            All articles
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 rounded-sm border border-border bg-linear-to-br from-amber/8 via-card to-cobalt/8 p-8 sm:p-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <p className="eyebrow">About</p>
          <div>
            <p className="font-display text-2xl leading-relaxed sm:text-[2rem] sm:leading-[1.4]">
              I studied computer engineering because I wanted to know how things work. I write
              because knowing how things work is useless if nobody understands the explanation.
            </p>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              By day, I build software. By choice, I read academic papers I have no professional
              obligation to read – and translate them into plain English or Portuguese, my native
              language. I always add a bit of humor, because a well-placed joke is the cheapest way
              to keep a reader past paragraph three.
            </p>
            <Link
              to="/about"
              className="link-underline mt-8 inline-flex items-center gap-2 text-sm text-accent"
            >
              More about me
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
