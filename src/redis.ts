import { createClient } from "redis";

export const EXPIRATION_TIME = 60 * 60 * 1; // 24 hours

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

export async function setCachedData(key: string, data: any, expiration?: number) {
  await redisClient.set(key, JSON.stringify(data), { EX: expiration || EXPIRATION_TIME });
}

export async function deleteCachedData(key: string) {
  await redisClient.del(key);
}

export async function flushAllCachedData() {
  await redisClient.flushAll();
}
