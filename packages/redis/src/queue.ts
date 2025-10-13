import { RedisClientType } from "redis";
import client from "./index";

export const priceUpdatePusher: RedisClientType = client.duplicate();

export const tradePusher: RedisClientType = client.duplicate();

export const enginePuller: RedisClientType = client.duplicate();

export const enginePusher: RedisClientType = client.duplicate();

export const httpPusher: RedisClientType = client.duplicate();
