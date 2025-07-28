// reset.ts
import redis from "./redis";

await Promise.all([
  redis.del("frontier"),
  redis.del("pages_outbox"),
  redis.del("crawler:processed", "crawler:errors", "hosts"),
  redis.xgroup("DESTROY", "frontier", "crawlers").catch(() => {}),
  redis.xgroup("DESTROY", "pages_outbox", "dbwriters").catch(() => {}),
]);

console.log("🧹  Redis dev queue wiped. Ready for a fresh crawl!");
process.exit(0);
