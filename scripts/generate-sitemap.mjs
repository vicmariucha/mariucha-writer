import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const BASE_URL = "https://writer.vicmariucha.com.br"; 

async function main() {
  const entries = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/articles", changefreq: "weekly", priority: "0.9" },
    { path: "/about", changefreq: "monthly", priority: "0.8" },
    { path: "/contact", changefreq: "monthly", priority: "0.7" },
  ];

  try {
    const supabase = createClient(
      process.env["SUPABASE_URL"],
      process.env["SUPABASE_PUBLISHABLE_KEY"],
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("published", true)
      .lte("published_at", new Date().toISOString());
    for (const row of data ?? []) {
      entries.push({
        path: `/articles/${row.slug}`,
        ...(row.updated_at ? { lastmod: new Date(row.updated_at).toISOString() } : {}),
        changefreq: "monthly",
        priority: "0.8",
      });
    }
  } catch (err) {
    console.error("Falha ao buscar posts do Supabase, gerando sitemap só com rotas estáticas:", err);
  }

  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  );

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");

  writeFileSync("public/sitemap.xml", xml, "utf-8");
  console.log("sitemap.xml gerado em public/sitemap.xml");
}

main();