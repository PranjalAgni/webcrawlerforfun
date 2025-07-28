import { SEED_URLS } from "./seed.ts";
import { enqueue } from "./queue.ts";

async function main() {
  console.log("🐢  Starting crawler and adding seed urls");
  await enqueue(SEED_URLS, 0);
}

main();
