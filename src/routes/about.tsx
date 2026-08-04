import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowRight } from "lucide-react";
import authorPhoto from "@/assets/author.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Elena Marsh — Science Communicator" },
      {
        name: "description",
        content:
          "Molecular biologist turned science journalist. Elena Marsh writes about biotech, climate and neuroscience for Quanta, The Atlantic, Wired and more.",
      },
      { property: "og:title", content: "About Elena Marsh — Science Communicator" },
      {
        property: "og:description",
        content:
          "Molecular biologist turned science journalist, writing for Quanta, The Atlantic, Wired and more.",
      },
    ],
  }),
  component: AboutPage,
});

const credentials = [
  { k: "PhD, Molecular Biology", v: "University of Edinburgh, 2016" },
  { k: "MA, Science Journalism", v: "City, University of London, 2018" },
  { k: "ABSW Award", v: "Feature of the Year, finalist 2024" },
  { k: "Knight Fellowship", v: "Science communication residency, 2022" },
];

const outlets = [
  "Quanta Magazine",
  "The Atlantic",
  "Wired",
  "Nautilus",
  "STAT News",
  "Scientific American",
  "Undark",
  "Aeon",
];

function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-16">
        <div>
          <div className="overflow-hidden border border-border bg-secondary">
            <img
              src={authorPhoto}
              alt="Portrait of science writer Elena Marsh"
              width={912}
              height={1104}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Elena Marsh, photographed in Edinburgh, 2026.
          </p>
        </div>

        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-5 font-display text-[2.4rem] leading-[1.08] sm:text-5xl">
            Science is a story about people. I write that story.
          </h1>
          <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
            <p className="text-foreground">
              I trained as a molecular biologist and spent six years in a chromatin lab before
              realising the questions that kept me up at night were about how research travels —
              from a fluorescence microscope to a policy briefing to a kitchen-table conversation.
            </p>
            <p>
              Since 2018 I've written longform features, investigations and explainers for outlets
              across the UK and US. My reporting starts in the primary literature and ends with the
              people living downstream of it: patients, engineers, farmers, regulators, and the
              researchers themselves.
            </p>
            <p>
              I specialise in biotechnology and genome editing, climate science and adaptation,
              neuroscience, planetary science, and public health. Alongside journalism, I consult
              with research institutes on science communication strategy and edit technical copy
              into something a general reader will actually finish.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/cv-elena-marsh.pdf"
              download
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background transition-all duration-300 hover:shadow-elevate"
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Download CV
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-6 py-3 text-sm transition-colors duration-300 hover:border-foreground hover:bg-secondary"
            >
              Work with me
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-24 border-t border-border pt-10">
        <p className="eyebrow">Bylines</p>
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {outlets.map((o) => (
            <span
              key={o}
              className="font-display text-lg text-muted-foreground transition-colors duration-300 hover:text-foreground sm:text-xl"
            >
              {o}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-border pt-10">
        <p className="eyebrow">Credentials</p>
        <dl className="mt-6 grid gap-8 sm:grid-cols-2">
          {credentials.map((c) => (
            <div key={c.k} className="border-l border-accent/50 pl-5">
              <dt className="font-display text-xl">{c.k}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{c.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
