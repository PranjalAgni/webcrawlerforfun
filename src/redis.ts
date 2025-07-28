import Redis from "ioredis";

// Assemble connection details
const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST ?? "127.0.0.1"}:${
    process.env.REDIS_PORT ?? "6379"
  }${
    process.env.REDIS_PASSWORD ? `?password=${process.env.REDIS_PASSWORD}` : ""
  }`;

// Create client
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 5,
  connectTimeout: 10_000,
});

redis.on("connect", () => {
  console.log("✅  Redis connected:", redisUrl);
});

redis.on("error", (err) => {
  console.error("❌  Redis error:", err);
});

// Graceful shutdown helper – call in SIGINT/SIGTERM handler
export async function closeRedis() {
  try {
    await redis.quit();
    console.log("👋  Redis connection closed");
  } catch (e) {
    console.error("Redis quit error:", e);
  }
}

export default redis;
