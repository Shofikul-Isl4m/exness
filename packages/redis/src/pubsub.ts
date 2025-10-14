import { RedisClientType } from "redis";
import client from "./index.js";

export const publisher: RedisClientType = client.duplicate();
export const subscriber: RedisClientType = client.duplicate();
