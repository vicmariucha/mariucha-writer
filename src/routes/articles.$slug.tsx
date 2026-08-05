import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { articles, formatDate, tagColor } from "@/data/articles";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} – Victória Mariucha` },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: ArticleNotFound,
  component: ArticlePage,
});

function ArticleNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
      <h1 className="font-display text-4xl">This one doesn't exist (yet)</h1>
      <p className="mt-4 text-muted-foreground">
        Either I haven't written it, or the URL got creative on the way here.
      </p>
      <Link to="/articles" className="link-underline mt-8 inline-block text-sm text-terracotta">
        Back to the archive
      </Link>
    </section>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const tone = tagColor[article.tag] ?? "text-accent border-accent/40 bg-accent/8";
  const idx = articles.findIndex((a) => a.slug === article.slug);
  const next = articles[(idx + 1) % articles.length]!;

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <Link
        to="/articles"
        className="link-underline inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        The archive
      </Link>

      <span
        className={`mt-8 inline-block rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${tone}`}
      >
        {article.tag}
      </span>

      <h1 className="mt-5 font-display text-[2.2rem] leading-[1.1] sm:text-5xl">{article.title}</h1>

      <p className="mt-5 text-sm text-muted-foreground">
        {formatDate(article.date)} · {article.readTime} · <em>{article.publication}</em>
      </p>

      <p className="mt-8 border-l-2 border-plum/60 pl-5 font-display text-xl leading-relaxed text-foreground sm:text-2xl">
        {article.excerpt}
      </p>

      <div className="mt-10 space-y-6 text-[1.02rem] leading-[1.85] text-muted-foreground">
        {article.body.map((p, i) => (
          <p key={i} className={i === 0 ? "text-foreground" : undefined}>
            {p}
          </p>
        ))}
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <p className="eyebrow">Read next</p>
        <Link
          to="/articles/$slug"
          params={{ slug: next.slug }}
          className="group mt-4 flex items-end justify-between gap-6"
        >
          <span className="font-display text-2xl leading-snug transition-colors group-hover:text-terracotta sm:text-3xl">
            {next.title}
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
