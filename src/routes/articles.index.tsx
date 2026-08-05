import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { postsQuery } from "@/lib/blog";

export const Route = createFileRoute("/articles/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQuery);
  },

  head: () => ({
    meta: [
      { title: "Articles by Vic Mariucha – Science & Technology Writing" },
      {
        name: "description",
        content:
          "Science writing portfolio: essays and explainers on space, health, environment, AI and code by freelance science writer Vic Mariucha. Filter by topic or search.",
      },
      { property: "og:title", content: "Articles by Vic Mariucha – Science & Technology Writing" },
      {
        property: "og:description",
        content:
          "Essays and explainers on space, health, environment, AI and code by freelance science writer Vic Mariucha.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mariucha-writer.lovable.app/articles" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mariucha-writer.lovable.app/articles" }],
  }),

  errorComponent: ({ error }) => (
    <p role="alert" className="mx-auto max-w-3xl px-5 py-24 text-center text-muted-foreground">
      {error.message}
    </p>
  ),
  component: ArticlesPage,
});

type SortKey = "recent" | "oldest" | "featured";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Most recent" },
  { key: "oldest", label: "Oldest first" },
  { key: "featured", label: "Featured" },
];

function ArticlesPage() {
  const { data: articles } = useSuspenseQuery(postsQuery);
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  // Only show tags that actually have at least one published article.
  const usedTags = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const a of articles) {
      for (const t of a.tagList) {
        const found = map.get(t.name);
        map.set(t.name, { name: t.name, count: (found?.count ?? 0) + 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = articles.filter((a) => {
      const matchTag = !active || a.tagList.some((t) => t.name === active);
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.publication.toLowerCase().includes(q) ||
        a.tagList.some((t) => t.name.toLowerCase().includes(q));
      return matchTag && matchQuery;
    });
    const byDate = (dir: number) => (a: typeof list[number], b: typeof list[number]) =>
      dir * (new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    if (sort === "oldest") return [...list].sort(byDate(-1));
    if (sort === "featured")
      return [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || byDate(1)(a, b));
    return [...list].sort(byDate(1));
  }, [articles, active, query, sort]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="eyebrow">The archive</p>
      <h1 className="mt-5 max-w-3xl font-display text-[2.4rem] leading-[1.08] sm:text-6xl">
        Articles, essays and <em className="italic text-terracotta">extremely detailed tangents</em>
      </h1>
      <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
        Everything I've written, plus a few pieces my editor
        (me) probably should have questioned. Filter by topic or search the archive.
      </p>

      <div className="mt-12 flex flex-col gap-6 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterTag label="All" active={active === null} onClick={() => setActive(null)} />
          {usedTags.map((t) => (
            <FilterTag
              key={t.name}
              label={`#${t.name}`}
              active={active === t.name}
              onClick={() => setActive(active === t.name ? null : t.name)}
            />
          ))}
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative w-full sm:w-52">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort articles"
              className="w-full appearance-none rounded-full border border-border bg-card py-2.5 pl-4 pr-10 text-sm outline-none transition-colors hover:border-foreground/40 focus:border-accent"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
