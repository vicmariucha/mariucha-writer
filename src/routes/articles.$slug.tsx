import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CommentsSection } from "@/components/comments-section";
import { PostInteractions } from "@/components/post-interactions";
import { formatDate, postQuery, postsQuery, readTime, tagVisual } from "@/lib/blog";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ context, params }) => {
    const [post] = await Promise.all([
      context.queryClient.ensureQueryData(postQuery(params.slug)),
      context.queryClient.ensureQueryData(postsQuery),
    ]);
    if (!post) throw notFound();
    return { title: post.title, excerpt: post.excerpt, image: post.cover_image_url };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} – Victória Mariucha` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData.image?.startsWith("https://")
          ? [
              { property: "og:image", content: loaderData.image },
              { name: "twitter:image", content: loaderData.image },
            ]
          : []),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <p role="alert" className="mx-auto max-w-3xl px-5 py-24 text-center text-muted-foreground">
      {error.message}
    </p>
  ),
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
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(postQuery(slug));
  const { data: posts } = useSuspenseQuery(postsQuery);

  if (!article) return <ArticleNotFound />;

  const idx = posts.findIndex((a) => a.slug === article.slug);
  const next = posts[(idx + 1) % posts.length];

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <Link
        to="/articles"
        className="link-underline inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        The archive
      </Link>

      <div className="mt-8" />
      <div className="flex flex-wrap gap-2">
        {article.tagList.map((t) => {
          const v = tagVisual(t.color);
          return (
            <span
              key={t.id}
              style={v.style}
              className={`inline-block rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${v.className}`}
            >
              {t.name}
            </span>
          );
        })}
      </div>


      <h1 className="mt-5 font-display text-[2.2rem] leading-[1.1] sm:text-5xl">{article.title}</h1>

      <p className="mt-5 text-sm text-muted-foreground">
        {formatDate(article.published_at)} · {readTime(article.body_html)}
        {article.publication ? (
          <>
            {" "}
            · <em>{article.publication}</em>
          </>
        ) : null}
      </p>

      {article.cover_image_url && (
        <img
          src={article.cover_image_url}
          alt={article.cover_image_alt ?? article.title}
          className="mt-8 w-full rounded-sm object-cover"
        />
      )}

      <p className="mt-8 border-l-2 border-plum/60 pl-5 font-display text-xl leading-relaxed text-foreground sm:text-2xl">
        {article.excerpt}
      </p>

      <div
        className="article-body mt-10"
        // Content is authored only by the site owner through the admin editor.
        dangerouslySetInnerHTML={{ __html: article.body_html }}
      />

      <div className="mt-12">
        <PostInteractions
          slug={article.slug}
          views={article.views}
          likes={article.likes}
          title={article.title}
        />
      </div>

      {next && next.slug !== article.slug && (
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
      )}

      <CommentsSection postId={article.id} />
    </article>
  );
}
