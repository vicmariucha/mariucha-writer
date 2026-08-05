import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { articles, tags } from "@/data/articles";

export const Route = createFileRoute("/articles")({
  head: () => ({
    meta: [
      { title: "Articles – Victória Mariucha, Engineer & Science Writer" },
      {
        name: "description",
        content:
          "Essays and explainers on code, AI, space, science and Spider-Man by Victória Mariucha. Filter by topic or search by keyword.",
      },
      { property: "og:title", content: "Articles – Victória Mariucha, Engineer & Science Writer" },
      {
        property: "og:description",
        content: "Essays and explainers on code, AI, space, science and one friendly neighborhood superhero.",
      },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchTag = !active || a.tag === active;
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.publication.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q);
      return matchTag && matchQuery;
    });
  }, [active, query]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="eyebrow">The archive</p>
      <h1 className="mt-5 max-w-3xl font-display text-[2.4rem] leading-[1.08] sm:text-6xl">
        Articles, essays and <em className="italic text-terracotta">extremely detailed tangents</em>
      </h1>
      <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
        Everything I've written about code, AI, space and science – plus a few pieces my editor
        (me) probably should have questioned. Filter by topic or search the archive.
      </p>


      <div className="mt-12 flex flex-col gap-6 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterTag label="All" active={active === null} onClick={() => setActive(null)} />
          {tags.map((t) => (
            <FilterTag
              key={t}
              label={`#${t}`}
              active={active === t}
              onClick={() => setActive(active === t ? null : t)}
            />
          ))}
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            aria-label="Search articles"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="animate-fade-in py-24 text-center font-display text-2xl text-muted-foreground">
          Nothing here. Either I haven't written it yet, or you spelled it creatively.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterTag({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-all duration-300 ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
