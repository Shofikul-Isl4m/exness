import { WebSocketServer } from "ws";
import { subscriber } from "@repo/redis/pubsub";

const wss = new WebSocketServer({ port: 8080 });

(async () => {
  console.log("start ws");
  let isConnected = false;
  try {
    await subscriber.connect();
    console.log("sub connected");
    isConnected = true;
    
  } catch (error) {
    console.log(error);
    console.log("sub is not connected");
  }

  if(isConnected){
    subscriber.subscribe("ws:price:update",async (msg)=> {
      wss.clients.forEach(client => {
        client.send(msg)
        });
    })
  }


})();



wss.on("connection",() => {
  console.log("connected to ws")
})
