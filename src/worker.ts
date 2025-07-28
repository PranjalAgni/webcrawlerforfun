import { crawl } from "./crawler";
import { enqueue } from "./queue";
import redis from "./redis";
import { insertPage } from "./sqlite";

const GROUP = "crawlers";
const NAME = "w-" + process.pid;

await redis
  .xgroup("CREATE", "frontier", GROUP, "$", "MKSTREAM")
  .catch(() => {});

while (true) {
  const data = await redis.xreadgroup(
    "GROUP",
    GROUP,
    NAME,
    "COUNT",
    2,
    "BLOCK",
    5000,
    "STREAMS",
    "frontier",
    ">"
  );
  if (!data) continue;

  for (const [, msgs] of data) {
    for (const [id, f] of msgs) {
      const url = f[1] as string;
      const depth = Number(f[3]);
      if (depth > 3) continue;
      try {
        const { text, links, statusCode } = await crawl(url);
        console.log(`⚽ Links found for ${url}:`, links.length);
        await insertPage(url, text, statusCode);
        await enqueue(links, depth + 1);
        await redis.xack("frontier", GROUP, id);
        await redis.incr("crawler:processed");
      } catch (err) {
        console.error(`Failed crawling ${url}`);
      }
    }
  }
}
