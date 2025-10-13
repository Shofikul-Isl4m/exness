import { RedisClientType } from "redis";
import client from "./index";

export const publisher: RedisClientType = client.duplicate();
export const subscriber: RedisClientType = client.duplicate();
