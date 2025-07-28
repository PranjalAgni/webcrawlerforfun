import { searchText, setupSqlite } from "./sqlite";

// CLI usage:  bun run search.ts "crossfit games"
if (import.meta.main) {
  setupSqlite();
  const q = Bun.argv[2];
  if (!q) {
    console.error("usage: bun run search.ts <search‑terms>");
    process.exit(1);
  }
  const results = searchText(q);
  for (const r of results) {
    console.log("\nURL:", r.url);
    console.log("Date:", new Date(r.crawled_at * 1000).toISOString());
    console.log("Excerpt:", r.text.slice(0, 160).replace(/\s+/g, " "), "…");
    console.log("===========================");
  }
}
