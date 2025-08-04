import { spawn } from "bun";
import { setupSqlite } from "./sqlite";

setupSqlite();

const PROCESSES = 4;
const children = new Set<ReturnType<typeof spawn>>();

function start() {
  const child = spawn({
    cmd: ["bun", "src/worker.ts"],
    stdout: "inherit",
    stderr: "inherit",
  });
  children.add(child);

  child.exited.then(() => {
    children.delete(child);
    console.log("💥 worker exited – respawning");
  });
}

for (let i = 0; i < PROCESSES; i++) start();

process.on("SIGINT", () => {
  console.log("shutting down …");
  for (const c of children) c.kill();
});
