import { ArrowUpRight } from "lucide-react";
import { formatDate, tagColor, type Article } from "@/data/articles";

export function ArticleCard({ article, index }: { article: Article; index?: number }) {
  const tone = tagColor[article.tag] ?? "text-accent border-accent/40 bg-accent/8";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex h-full flex-col justify-between overflow-hidden border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-elevate sm:p-8"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-terracotta via-amber to-cobalt transition-transform duration-500 group-hover:scale-x-100" />
      <div>
        <div className="flex items-center justify-between gap-4">
          <span
            className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${tone}`}
          >
            {article.tag}
          </span>
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
          <p className="truncate italic">{article.publication}</p>
          <p className="mt-1">
            {formatDate(article.date)} · {article.readTime}
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-terracotta" />
      </div>
    </a>
  );
}
