import { WebSocket} from "ws"
import "dotenv/config"
import { BackpackDataType, FilteredDataType } from "@repo/types/types"
import {publisher} from "@repo/redis/pubsub"
import {priceUpdatePusher, tradePusher} from "@repo/redis/queue"




const ws = new WebSocket(process.env.BACKPACK_URL!);

let lastInsertTime = Date.now();
let assertPrices : Record<string,FilteredDataType> = {
ETH_USDC_PERP : {   ask_price : 0, bid_price : 0, decimal : 0 },
SOL_USDC_PERP : {   ask_price : 0, bid_price : 0, decimal : 0 },
BTC_USDC_PERP : {   ask_price : 0, bid_price : 0, decimal : 0 },
};


(async()=>{
   await  publisher.connect();
   await priceUpdatePusher.connect();
}

)()

ws.onopen = () => {
   
   console.log("connected to the backpack url");

   ws.send(
      JSON.stringify({
         method : "SUBSCRIBE",
         params : [
             "bookTicker.BTC_USDC_PERP",
             "bookTicker.ETH_USDC_PERP",
             "bookTicker.SOL_USDC_PERP"           
         ],
         id:1,
      })
   )

 console.log("Subscribe to backpack");

}

ws.onmessage=async(msg) => {
const data : BackpackDataType = JSON.parse(msg.data.toString()).data;

 const askPriceStr = Number(data.a).toFixed(4);
 const askPriceIntStr = askPriceStr.split(".")[0]! + askPriceStr.split(".")[1];
 const ask_price = Number(askPriceIntStr);

 const bidPriceStr = Number(data.b).toFixed(4);
 const bidPriceIntStr = bidPriceStr.split(".")[0]! + bidPriceStr.split(".")[1];
 const bid_price = Number(askPriceIntStr);
 
 const filteredData : FilteredDataType = {
    ask_price,
    bid_price,
    decimal :4 
  
 }

assertPrices[data.s] = filteredData;
console.log(assertPrices)

  if(Date.now() - lastInsertTime > 1000){
   const dataToBeSent : Record<string,FilteredDataType> = {};

  for(const [key,value] of Object.entries(assertPrices)){ 
   if(ask_price === 0) {
      continue
   }

   dataToBeSent[key] = value;

}

   publisher.publish("ws:price:update",JSON.stringify(dataToBeSent))
   priceUpdatePusher.xAdd("stream:app:info","*",{
      requId : "no return",
      type :  "price-update",
      tradePrices : JSON.stringify(dataToBeSent)
   })

   lastInsertTime = Date.now();


 }



}




