import redis from "./redis.ts";

export async function enqueue(urls: string[], depth: number) {
  const pipe = redis.pipeline();
  for (const url of urls) {
    pipe.xadd("frontier", "*", "url", url, "depth", depth);
  }

  await pipe.exec();
  await redis.incrby("crawler:urlcount", urls.length);
  console.log(`🐢  Added ${urls.length} urls to the queue`);
}
