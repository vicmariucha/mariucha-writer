import { ArrowUpRight, Code2 } from "lucide-react";

export function DeveloperCTA() {
  return (
    <div className="mt-16 flex flex-col gap-5 rounded-2xl border border-cobalt/35 bg-linear-to-br from-cobalt/10 via-card to-plum/10 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
      <div>
        <p className="eyebrow inline-flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-cobalt" />
          Developer side
        </p>
        <p className="mt-3 max-w-xl font-display text-2xl leading-tight sm:text-3xl">
          Want to know more about me as a developer?
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Repositories, side projects and commit messages written at questionable hours – it's all
          on my Dev Website.
        </p>
      </div>
      <a
        href="https://dev.vicmariucha.com.br/"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-cobalt px-6 py-3 text-sm text-background transition-all duration-300 hover:shadow-elevate sm:self-auto"
      >
        Click here
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
