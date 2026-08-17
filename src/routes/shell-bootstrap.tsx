import { createFileRoute } from "@tanstack/react-router";

/**
 * Internal, non-content route used only as the build-time target for the
 * SPA bootstrap shell (see `spa.maskPath` in vite.config.ts). It is never
 * linked to from real pages and is excluded from the sitemap automatically.
 * Keeping it separate from "/" lets the homepage get its own fully
 * data-rendered prerendered HTML instead of being hijacked as the shell.
 */
export const Route = createFileRoute("/shell-bootstrap")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => null,
});
