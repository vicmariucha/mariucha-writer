import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vic Mariucha – Science Writer & Freelance Developer Writer" },
      { name: "description", content: "Freelance science writer and developer writer. Vic Mariucha is a computer engineer in Brazil turning research on space, health, environment and technology into clear, engaging English." },
      { name: "author", content: "Victória Mariucha" },
      { name: "keywords", content: "science writer, freelance science writer, freelance writer, developer writer, technical writer, science communicator, technology writer, science journalism, Vic Mariucha" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Vic Mariucha" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Vic Mariucha – Science Writer & Freelance Developer Writer" },
      { name: "twitter:title", content: "Vic Mariucha – Science Writer & Freelance Developer Writer" },
      { property: "og:description", content: "Freelance science writer and developer writer turning research on space, health, environment and technology into clear, engaging English." },
      { name: "twitter:description", content: "Freelance science writer and developer writer turning research on space, health, environment and technology into clear, engaging English." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/33d7d032-00b3-411f-844b-24d0ae79bea5/id-preview-088be265--5acebda7-6162-4cc0-861d-c38349d13e7b.lovable.app-1785895597859.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/33d7d032-00b3-411f-844b-24d0ae79bea5/id-preview-088be265--5acebda7-6162-4cc0-861d-c38349d13e7b.lovable.app-1785895597859.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..600&family=Inter:wght@300;400;500;600&display=swap" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      { children: `(function(){try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();` },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": "https://writer.vicmariucha.com.br/#person",
              name: "Victória Mariucha",
              alternateName: "Vic Mariucha",
              url: "https://writer.vicmariucha.com.br",
              jobTitle: ["Science Writer", "Computer Engineer", "Software Developer"],
              description: "Freelance science writer and developer writer covering space, health, environment and technology.",
              address: { "@type": "PostalAddress", addressLocality: "Sorocaba", addressCountry: "BR" },
              email: "mailto:vicmariucha@gmail.com",
              knowsAbout: ["science writing", "science communication", "technology writing", "software development", "space", "environment", "health"],
              sameAs: ["https://github.com/vicmariucha", "https://www.linkedin.com/in/victoria-mariucha/", "https://substack.com/@vicmariucha", "https://vicmariucha.blogspot.com/", "https://www.instagram.com/ascienceble/"],
            },
            {
              "@type": "WebSite",
              "@id": "https://writer.vicmariucha.com.br/#website",
              name: "Vic Mariucha – Science Writer",
              url: "https://writer.vicmariucha.com.br",
              inLanguage: "en",
              publisher: { "@id": "https://writer.vicmariucha.com.br/#person" },
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: "https://writer.vicmariucha.com.br/articles?q={search_term_string}" },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}