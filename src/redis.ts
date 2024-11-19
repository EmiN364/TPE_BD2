import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export async function connectRedis() {
  await redisClient.connect();
}

export async function getCachedData(key: string) {
  const cachedData = await redisClient.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
}

export async function setCachedData(key: string, data: any) {
  await redisClient.set(key, JSON.stringify(data));
}
