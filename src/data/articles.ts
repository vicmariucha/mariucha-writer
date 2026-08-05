export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  publication: string;
  url: string;
  body: string[];
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
    body: [
      "It started, as these things do, at a kitchen table. My mother asked what I actually do all day, and I made the classic engineering mistake of answering honestly.",
      "Recursion is a function that calls itself until it reaches a case simple enough to answer directly. That is the whole idea. The trouble is that every metaphor for it sounds like a symptom: a mirror facing a mirror, a dream inside a dream, a person who explains a thing by explaining the same thing slightly smaller.",
      "What finally worked was food. Imagine a tray of pastel de feira. To count them, you take one off the tray and then count what is left. Eventually the tray is empty and you stop. That base case – the empty tray – is the part beginners forget, and it is exactly why their programs run forever.",
      "She understood it in about forty seconds. Then she asked why anyone would write code that way instead of just counting the pastéis. Reader, I did not have a good answer.",
    ],
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
    body: [
      "Large language models are extraordinary and they are not thinking. Both statements are true, and holding both at once is the entire skill of working with them professionally.",
      "Under the hood, a transformer converts text into vectors, lets every token look at every other token through attention, and produces a probability distribution over what comes next. Sample from that distribution repeatedly and you get fluent prose. Nowhere in that pipeline is there a belief, an intention, or a fact-checking step.",
      "This matters practically. A model that is confidently wrong is not lying, because lying requires knowing the truth. It is producing a high-probability continuation of your prompt. Once you internalise that, your prompts get better and your expectations get healthier.",
      "So: use them for drafts, transformations, summaries and rubber-ducking. Verify anything load-bearing. And stop asking whether the model understands you – ask whether the output survives review.",
    ],
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
    body: [
      "Every incident postmortem is secretly an origin story. Something went wrong, someone was changed by it, and afterwards there are new rules about radioactive spiders and production database access.",
      "The parallel is not just a joke. On-call teaches the same lesson Peter Parker learns in issue one: capability creates obligation. The moment you can deploy to production at 2am, you own what happens at 2:05.",
      "Good incident culture is blameless for the same reason good superhero stories are: the interesting question is never who caused it, it is what the system allowed. Missing alerts, no rollback path, one person holding all the context – those are the villains.",
      "Write the postmortem. Fix the category, not the instance. And keep the pager honest, because responsibility without sleep is just attrition with extra steps.",
    ],
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
    body: [
      "Let us take the web-shooters seriously for a moment, purely as an engineering artefact.",
      "The tensile requirement is brutal. Swinging a person of roughly 75 kg through an arc at urban speeds means peak line loads well beyond body weight, since centripetal acceleration at the bottom of the swing stacks on top of gravity. Spider silk is genuinely competitive with steel by weight, which is the single most plausible part of the whole design.",
      "The real problem is volume. Cartridges the size of a wristwatch battery holding enough fluid for an afternoon of city-wide travel implies a storage density that is, let us say, generous. Either the fluid expands enormously on contact with air, or the swings are much shorter than the films suggest.",
      "Verdict: the material science is defensible, the logistics are fiction, and the failure mode of a mid-swing cartridge empty is the most terrifying thing in the franchise.",
    ],
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
    body: [
      "I ran six layout experiments this month. Four failed, one worked, and one worked for reasons I still cannot fully articulate in a code review.",
      "The scientific method survives contact with CSS surprisingly well. You form a hypothesis about why the element is 3px off, you change exactly one property, you observe, and you resist the urge to change five things at once out of frustration.",
      "The failures were instructive. Flexbox and grid are not interchangeable, percentage heights need a resolved parent, and margin collapse remains the most polite bug in the language – it does something reasonable and never tells you.",
      "The one that worked involved subgrid. I am still writing up the results.",
    ],
  },
  {
    slug: "how-a-rocket-decides-to-not-explode",
    title: "How a Rocket Decides Not to Explode",
    excerpt:
      "Flight software, redundancy and the beautiful paranoia of aerospace engineering – explained by someone whose worst deploy only took down a staging server.",
    date: "2026-01-23",
    readTime: "8 min read",
    tag: "Space",
    publication: "Read by three friends and my cat",
    url: "https://example.com/rocket-software",
    body: [
      "Flight software is the most paranoid code ever written, and that paranoia is the product, not a side effect.",
      "The core idea is redundancy with disagreement handling. Multiple computers run the same computation, compare results, and vote. A sensor that drifts is outvoted rather than obeyed. There is no retry-and-hope, because there is no second launch.",
      "Everything is bounded: no dynamic memory allocation after initialisation, no unbounded loops, no surprises in worst-case execution time. Compared to web development, it is an entirely different relationship with uncertainty.",
      "My worst deploy took down a staging environment for eleven minutes. I think about that ratio often.",
    ],
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
    body: [
      "Hypothesis, experiment, observation, despair, coffee, conclusion. That is debugging, and apart from the coffee it is also science.",
      "The discipline is in the isolation. One variable at a time, a way to reproduce, and a written record of what you already ruled out. Engineers who keep that record find bugs in minutes; engineers who do not find the same bug three times.",
      "The despair step is real and worth naming. It usually arrives just before you question the assumption you never wrote down – the one that turns out to be wrong.",
      "Print statements are a legitimate instrument. Anyone who tells you otherwise has not shipped anything under a deadline.",
    ],
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
    body: [
      "For one week, every pull request I opened got an AI reviewer alongside the humans. Here are the results, presented with the enthusiasm of a mostly fair performance review.",
      "It caught two genuine bugs: an off-by-one in a pagination helper and an unhandled rejection that would only surface under a network timeout. Both were real, both were mine, and both were embarrassing in a productive way.",
      "It also invented a library. Confidently. With a version number and an import statement that looked exactly right until I tried to install it.",
      "Conclusion: excellent at pattern-level review, useless as an authority. Keep the humans, keep the reviewer, keep your scepticism.",
    ],
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
    body: [
      "Working from Sorocaba at UTC-3 has shaped how I build software more than any framework has.",
      "The morning overlaps with Europe, the afternoon overlaps with the United States, and the evening belongs to me. That structure forces asynchronous habits: written decisions, real pull request descriptions, and documentation that stands on its own at 3am in another hemisphere.",
      "It also means deploys happen when the rest of the team is asleep, which sounds risky and is actually excellent, provided the rollback is one command and the alerts are honest.",
      "And since Brazil dropped daylight saving, my calendar drifts twice a year while everyone else's does. Small victories.",
    ],
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
