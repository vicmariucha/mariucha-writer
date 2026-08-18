import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true, maskPath: "/shell-bootstrap" },
    prerender: {
      enabled: true,
      crawlLinks: true,
      filter: ({ path }: { path: string }) => !path.startsWith("/admin"),
    },
  },
  vite: {
    server: { host: "127.0.0.1" },
  },
  nitro: false,
});