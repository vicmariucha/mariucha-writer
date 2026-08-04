import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elena Marsh — Science Writer & Journalist" },
      {
        name: "description",
        content:
          "Translating complex science into compelling stories. Longform features on biotech, climate, space and neuroscience by science writer Elena Marsh.",
      },
      { property: "og:title", content: "Elena Marsh — Science Writer & Journalist" },
      {
        property: "og:description",
        content:
          "Translating complex science into compelling stories. Longform features on biotech, climate, space and neuroscience.",
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
        <p className="eyebrow animate-fade-in">Science journalism · Est. 2016</p>
        <h1 className="animate-fade-in mt-6 max-w-4xl font-display text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl">
          Translating complex science into{" "}
          <em className="italic text-terracotta">compelling stories</em>.
        </h1>
        <p className="animate-fade-in mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          I'm Elena Marsh — a molecular biologist turned journalist. I report on the people, data
          and consequences behind the research that shapes how we live.
        </p>
        <div className="animate-fade-in mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/articles"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm text-background transition-all duration-300 hover:shadow-elevate"
          >
            Read Articles
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-7 py-3 text-sm transition-all duration-300 hover:border-foreground hover:bg-secondary"
          >
            Get in Touch
          </Link>
        </div>

        <dl className="mt-20 grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
          {[
            { k: "180+", v: "Published features & investigations" },
            { k: "12", v: "Outlets, from Quanta to The Atlantic" },
            { k: "PhD", v: "Molecular biology, Edinburgh" },
          ].map((s) => (
            <div key={s.k}>
              <dt className="font-display text-3xl">{s.k}</dt>
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
        <div className="grid gap-10 border-t border-border pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <p className="eyebrow">About</p>
          <div>
            <p className="font-display text-2xl leading-relaxed sm:text-[2rem] sm:leading-[1.4]">
              I spent six years at the bench before deciding the more interesting experiment was
              explaining the work to everyone outside the lab.
            </p>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              Today I write features, explainers and investigations at the intersection of science
              communication, journalism and narrative storytelling — with a reporting practice built
              on primary literature, rigorous sourcing and a deep suspicion of press releases.
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
