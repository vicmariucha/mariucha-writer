export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  publication: string;
  url: string;
  featured?: boolean;
};

export const tags = ["Biotech", "Climate", "Space", "Neuroscience", "Health"] as const;

export const articles: Article[] = [
  {
    slug: "the-quiet-revolution-in-base-editing",
    title: "The Quiet Revolution in Base Editing",
    excerpt:
      "A new generation of gene editors rewrites single letters of DNA without cutting the double helix — and the first patients are already living proof.",
    date: "2026-06-18",
    readTime: "9 min read",
    tag: "Biotech",
    publication: "Nautilus",
    url: "https://example.com/base-editing",
    featured: true,
  },
  {
    slug: "the-ocean-remembers-every-degree",
    title: "The Ocean Remembers Every Degree",
    excerpt:
      "Marine heatwaves are no longer anomalies. Inside the labs reconstructing three centuries of sea temperature from coral skeletons.",
    date: "2026-05-02",
    readTime: "12 min read",
    tag: "Climate",
    publication: "The Atlantic",
    url: "https://example.com/ocean-memory",
    featured: true,
  },
  {
    slug: "what-the-dust-between-stars-is-hiding",
    title: "What the Dust Between Stars Is Hiding",
    excerpt:
      "JWST keeps finding organic molecules where nobody expected them. Astrochemists are rewriting the recipe for planetary chemistry.",
    date: "2026-04-11",
    readTime: "7 min read",
    tag: "Space",
    publication: "Quanta Magazine",
    url: "https://example.com/interstellar-dust",
    featured: true,
  },
  {
    slug: "the-brain-that-rewires-itself-overnight",
    title: "The Brain That Rewires Itself Overnight",
    excerpt:
      "Sleep is not downtime. New imaging shows the cortex pruning, replaying and consolidating in choreographed waves.",
    date: "2026-03-07",
    readTime: "6 min read",
    tag: "Neuroscience",
    publication: "Wired",
    url: "https://example.com/sleep-rewiring",
  },
  {
    slug: "antibiotics-are-running-out-of-road",
    title: "Antibiotics Are Running Out of Road",
    excerpt:
      "Resistance outpaces discovery. A handful of small labs are betting on bacteriophages to buy medicine another century.",
    date: "2026-02-14",
    readTime: "10 min read",
    tag: "Health",
    publication: "STAT News",
    url: "https://example.com/phage-therapy",
  },
  {
    slug: "the-carbon-ledger-nobody-audits",
    title: "The Carbon Ledger Nobody Audits",
    excerpt:
      "Offset markets promise permanence they cannot measure. What satellite forestry data reveals about the gap.",
    date: "2026-01-23",
    readTime: "8 min read",
    tag: "Climate",
    publication: "Grist",
    url: "https://example.com/carbon-ledger",
  },
  {
    slug: "growing-organs-on-a-lattice",
    title: "Growing Organs on a Lattice",
    excerpt:
      "Bioprinted vasculature was the bottleneck for a decade. A sugar-based scaffold may have cleared it.",
    date: "2025-12-05",
    readTime: "5 min read",
    tag: "Biotech",
    publication: "Undark",
    url: "https://example.com/bioprinting",
  },
  {
    slug: "the-cost-of-listening-to-the-universe",
    title: "The Cost of Listening to the Universe",
    excerpt:
      "Radio astronomy's quiet zones are shrinking as satellite constellations multiply overhead.",
    date: "2025-11-19",
    readTime: "4 min read",
    tag: "Space",
    publication: "Scientific American",
    url: "https://example.com/radio-quiet",
  },
  {
    slug: "memory-without-a-hippocampus",
    title: "Memory Without a Hippocampus",
    excerpt:
      "Rare patients are forcing neuroscientists to reconsider where autobiographical memory actually lives.",
    date: "2025-10-02",
    readTime: "11 min read",
    tag: "Neuroscience",
    publication: "Aeon",
    url: "https://example.com/memory-hippocampus",
  },
];

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
