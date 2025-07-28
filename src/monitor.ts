import redis from "./redis";
import ora from "ora";
import { SingleBar } from "cli-progress";

// const spinner = ora("waiting for metrics …").start();
const bar = new SingleBar({
  format: "Frontier |{bar}| {value}/{total} urls",
});
bar.start(1, 0);

let processed = 0;

setInterval(async () => {
  const len = await redis.xlen("frontier");
  let pending = 0;
  try {
    const [totalPend] = await redis.xpending("frontier", "crawlers");
    pending = totalPend as number;
  } catch (_) {
    /* group not yet created */
  }

  processed = Number((await redis.get("crawler:processed")) ?? 0);

  const remaining = len + pending;
  const total = remaining + processed;

  bar.setTotal(total || 1);
  bar.update(processed);

  // spinner.text = `pending: ${pending} | processed: ${processed}`;
}, 2000);

/* exit cleanly */
process.on("SIGINT", () => {
  bar.stop();
  // spinner.stop();
  process.exit();
});
