import { createClient, RedisClientType } from "redis";

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL,
});

export default client;
export type TypeOfRedisClient = RedisClientType;

