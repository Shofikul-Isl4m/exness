import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub";

const wss = new WebSocketServer({ port: 8080 });

async () => {
  await subscriber.connect();
};
