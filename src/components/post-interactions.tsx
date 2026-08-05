import { Heart, Link2, Linkedin, MessageCircle, Twitter, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { incrementPostLikes, incrementPostViews } from "@/lib/site.functions";


export function PostInteractions({
  slug,
  views,
  likes,
  title,
}: {
  slug: string;
  views: number;
  likes: number;
  title: string;
}) {
  const [viewCount, setViewCount] = useState(views);
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
    setLiked(window.localStorage.getItem(`liked:${slug}`) === "1");

    const key = `viewed:${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void incrementPostViews({ data: { slug } })
      .then(() => setViewCount((v) => v + 1))
      .catch(() => undefined);
  }, [slug]);

  async function toggleLike() {
    const delta = liked ? -1 : 1;
    setLiked(!liked);
    setLikeCount((c) => Math.max(0, c + delta));
    window.localStorage.setItem(`liked:${slug}`, liked ? "0" : "1");
    await incrementPostLikes({ data: { slug, delta } }).catch(() => undefined);
  }


  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const share = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3 border-y border-border py-4">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
          liked
            ? "border-terracotta bg-terracotta/10 text-terracotta"
            : "border-border text-muted-foreground hover:border-terracotta/50 hover:text-terracotta"
        }`}
      >
        <Heart className={`h-4 w-4 transition-transform group-hover:scale-110 ${liked ? "fill-current" : ""}`} />
        {likeCount}
      </button>

      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        {viewCount} {viewCount === 1 ? "view" : "views"}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          title="Copy link"
          aria-label="Copy link"
          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-cobalt/50 hover:text-cobalt"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`}
          target="_blank"
          rel="noreferrer"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-cobalt/50 hover:text-cobalt"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href={`https://wa.me/?text=${text}%20${share}`}
          target="_blank"
          rel="noreferrer"
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${share}&text=${text}`}
          target="_blank"
          rel="noreferrer"
          title="Share on X"
          aria-label="Share on X"
          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-plum/50 hover:text-plum"
        >
          <Twitter className="h-4 w-4" />
        </a>
        {copied && <span className="text-xs text-accent">Link copied</span>}
      </div>
    </div>
  );
}
