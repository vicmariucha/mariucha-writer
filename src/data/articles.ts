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

export const tags = ["Code", "AI", "Space", "Science", "Web Dev", "Spider-Man"] as const;

export const articles: Article[] = [
  {
    slug: "i-explained-recursion-to-my-mother",
    title: "I Explained Recursion to My Mother and She Called the Doctor",
    excerpt:
      "A field guide to explaining computer science to people who love you but would very much like you to speak human. Contains one metaphor involving pastel de feira.",
    date: "2026-06-18",
    readTime: "6 min read",
    tag: "Code",
    publication: "My blog (aka this website)",
    url: "https://example.com/recursion",
    featured: true,
  },
  {
    slug: "your-model-is-not-thinking",
    title: "Your Model Is Not Thinking, It Is Doing Very Confident Autocomplete",
    excerpt:
      "What actually happens inside a transformer, minus the hype and minus the math anxiety. Written for engineers who nod politely in AI meetings.",
    date: "2026-05-02",
    readTime: "9 min read",
    tag: "AI",
    publication: "Written at 2am, obviously",
    url: "https://example.com/not-thinking",
    featured: true,
  },
  {
    slug: "with-great-uptime",
    title: "With Great Uptime Comes Great Responsibility",
    excerpt:
      "On-call rotations, radioactive spiders, and why every incident postmortem is secretly an origin story. Yes, this is a Spider-Man piece. No, I will not apologize.",
    date: "2026-04-11",
    readTime: "5 min read",
    tag: "Spider-Man",
    publication: "Peer-reviewed by nobody",
    url: "https://example.com/great-uptime",
    featured: true,
  },
  {
    slug: "the-physics-of-web-shooters",
    title: "The Physics of Web-Shooters: An Engineering Review",
    excerpt:
      "Tensile strength, swing dynamics and cartridge capacity. I did the math so you don't have to, and honestly the numbers are not terrible.",
    date: "2026-03-07",
    readTime: "7 min read",
    tag: "Science",
    publication: "Unsolicited but rigorous",
    url: "https://example.com/web-shooters",
  },
  {
    slug: "css-is-a-science",
    title: "CSS Is a Science and I Have the Failed Experiments to Prove It",
    excerpt:
      "Six layout hypotheses, four rejected, one that worked for reasons I still cannot fully justify in a code review.",
    date: "2026-02-14",
    readTime: "4 min read",
    tag: "Web Dev",
    publication: "Lab notebook, Sorocaba branch",
    url: "https://example.com/css-science",
  },
  {
    slug: "how-a-rocket-decides-to-not-explode",
    title: "How a Rocket Decides Not to Explode",
    excerpt:
      "Flight software, redundancy and the beautiful paranoia of aerospace engineering — explained by someone whose worst deploy only took down a staging server.",
    date: "2026-01-23",
    readTime: "8 min read",
    tag: "Space",
    publication: "Read by three friends and my cat",
    url: "https://example.com/rocket-software",
  },
  {
    slug: "debugging-is-the-scientific-method",
    title: "Debugging Is Just the Scientific Method With Worse Lighting",
    excerpt:
      "Hypothesis, experiment, observation, despair, coffee, conclusion. A short defense of engineers as practicing scientists.",
    date: "2025-12-05",
    readTime: "5 min read",
    tag: "Code",
    publication: "Written between two sprints",
    url: "https://example.com/debugging-science",
  },
  {
    slug: "i-let-an-llm-review-my-pull-request",
    title: "I Let an LLM Review My Pull Request for a Week",
    excerpt:
      "It caught two real bugs, invented one library, and complimented my variable names. A mostly fair performance review.",
    date: "2025-11-19",
    readTime: "6 min read",
    tag: "AI",
    publication: "Empirical, sort of",
    url: "https://example.com/llm-reviewer",
  },
  {
    slug: "brazil-time-zone-driven-development",
    title: "Time-Zone-Driven Development: Notes From UTC-3",
    excerpt:
      "Building with distributed teams from Sorocaba, where the standups are early, the deploys are late, and daylight saving is thankfully not my problem anymore.",
    date: "2025-10-02",
    readTime: "4 min read",
    tag: "Web Dev",
    publication: "Filed from São Paulo time",
    url: "https://example.com/utc-3",
  },
];

export const tagColor: Record<string, string> = {
  Code: "text-cobalt border-cobalt/40 bg-cobalt/8",
  AI: "text-plum border-plum/40 bg-plum/8",
  Space: "text-foreground border-foreground/30 bg-foreground/5",
  Science: "text-accent border-accent/40 bg-accent/8",
  "Web Dev": "text-amber border-amber/50 bg-amber/10",
  "Spider-Man": "text-terracotta border-terracotta/40 bg-terracotta/8",
};

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
