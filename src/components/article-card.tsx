import { ArrowUpRight, Eye, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDate, readTime, tagVisual, type Post } from "@/lib/blog";

export function ArticleCard({ article, index }: { article: Post; index?: number }) {


  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug }}
      className="group relative flex h-full flex-col justify-between overflow-hidden border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-elevate sm:p-8"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-terracotta via-amber to-cobalt transition-transform duration-500 group-hover:scale-x-100" />
      <div>
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.cover_image_alt ?? article.title}
            loading="lazy"
            className="mb-6 aspect-[16/9] w-full rounded-sm object-cover"
          />
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {article.tagList.map((t) => {
              const v = tagVisual(t.color);
              return (
                <span
                  key={t.id}
                  style={v.style}
                  className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${v.className}`}
                >
                  {t.name}
                </span>
              );
            })}
          </div>

          {typeof index === "number" && (
            <span className="font-display text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
        </div>
        <h3 className="mt-5 font-display text-2xl leading-snug transition-colors group-hover:text-terracotta sm:text-[1.7rem]">
          {article.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
      </div>
      <div className="mt-8 flex items-end justify-between gap-4 border-t border-border pt-4">
        <div className="min-w-0 text-xs text-muted-foreground">
          {article.publication && <p className="truncate italic">{article.publication}</p>}
          <p className="mt-1">
            {formatDate(article.published_at)} · {readTime(article.body_html)}
          </p>
          <p className="mt-1 inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {article.likes}
            </span>
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-terracotta" />
      </div>
    </Link>
  );
}
