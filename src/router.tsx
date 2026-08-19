import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Without this, the server and client each get their own empty
  // QueryClient: the server renders full content (posts, comments, view
  // counts…) using data fetched during the loader, but the client starts
  // from a blank cache and refetches everything after hydration. Every
  // async-loaded section briefly collapses to its "no data yet" state and
  // then snaps back once the client fetch resolves — a real, measured
  // contributor to layout shift on every page. This streams the server's
  // query cache down and seeds the client's QueryClient with it, so
  // hydration starts already knowing what the server already rendered.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
