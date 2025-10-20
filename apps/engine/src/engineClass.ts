import { typeOfRedisClientType } from "@repo/redis/index"
import {GetAssetbalMsg, Message, MessageSchema, PriceUpdateMsg, TradeCloseMsg, TradeOpenMsg} from "@repo/types/zodSchema"
import {AssetBal, EngineResponseType, FilteredDataType, openOrders, orderType, userBalace} from "@repo/types/types"
import z from "zod"
export class Engine {
     constructor (
        private readonly enginePuller : typeOfRedisClientType,
        private readonly enginePusher : typeOfRedisClientType,
        private readonly mongo : 
     )  {}
    
      

     private readonly streamKey = "stream:app:info";
     private readonly groupName = "group-1"
     private readonly consumerName ="consumer-1"
     private lastConsumedStreamId = "...d"
     private lastSnapShotAt = Date.now()
     private openOrders : Record<string,openOrders[]> = {};
     private userBalace : Record<string,userBalace>= {};
     private dbName = "exness-snapshot";
     private collectionName = "engine-backup"

     private currentPrice : Record<string,FilteredDataType> = {
      "BTC_USDC_PERP" :{ask_price:0 ,bid_price:0, decimal:4},
      "ETH_USDC_PERP" :{ask_price : 0 ,bid_price:0,decimal:4},
      "SOL_USDC_PERP" :{ask_price : 0 ,bid_price:0,decimal:4},
     }
      

     async run() :Promise<void> {
       await this.enginePuller.connect();
       await this.enginePusher.connect();
       await this.mongo.connect();
         
       try {
         await this.enginePuller.xGroupCreate(this.streamKey,this.groupName,"0",{
            MKSTREAM : true
         })


       } catch (error) {
        console.log("group exist");
       }
     

         while(true){
            try {
                this.enginePuller.xGroupSetId(this.streamKey,this.groupName,
                    "$"
              )
             
          const res =  await this.enginePuller.xReadGroup(
             this.groupName,
             this.consumerName,
             {
             key:this.streamKey,id: ">"
           },
           {BLOCK:0 ,COUNT : 1}
         )
 
 
         if(res && res[0]){
             const entry = res[0].messages[0];
             this.lastConsumedStreamId = entry!.id;
             try {
                 const  msg = this.parseMessage(entry!.message);
                 await this.handleMessage(msg);
 
             } catch (error) {
                 console.log(error);
             }
         }
 
         if(Date.now() - this.lastSnapShotAt > 5000){
            this.persistSnapShot();
            this.enginePuller.xTrim(this.streamKey,"MAXLEN",10000);
 
         }

          }
                
             catch (error) {
                console.log(error)
                
            }

     }

    }

  private parseMessage (raw:unknown):Message {
    return MessageSchema.parse(raw);

  }


  private async handleMessage (msg:Message){
    let res : EngineResponseType | undefined = undefined;
    switch(msg.type){
      case "price-update" : 
      await this.handlePriceUpdate(PriceUpdateMsg.parse(msg));
     case "trade-open" :
     res = await this.handleTradeOpen(TradeOpenMsg.parse(msg));
      case "trade-close" : 
      res = await this.handleTradeClose(TradeCloseMsg.parse(msg)) 
      case "get-asset-bal": 
      res = await this.handleGetAssetBalance(GetAssetbalMsg.parse(msg));


        

  }

  } 

  private async handlePriceUpdate(msg : z.infer<typeof PriceUpdateMsg>) {
            const tradePrices = JSON.parse(msg.tradePrices);
            
            for(const [key,value] of Object.entries(tradePrices)){
                this.currentPrice[key] = value as FilteredDataType
            }

            for (const [userId , orders] of Object.entries(this.openOrders)){
                for( const order of [...orders]){
             const price = this.currentPrice[order.asset];
             if(!price) continue ;
            
              const assetPrice = order.type === "long" ? price.bid_price : price.ask_price;

              if(assetPrice === null) continue;

              const priceChange = order.type === "long" ? assetPrice - order.openPrice : order.openPrice-assetPrice;

              const pnl = (priceChange * order.leverage * order.margin)  / 10 ** 4;

              const pnlStr = pnl.toFixed(4);
              const pnlIntStr = pnlStr.split(".")[0]! + pnlStr.split(".")[1] ; 
              const pnlInt = Number(pnlIntStr);
              
              const lossTakingCapacity = order.margin / order.leverage;
              const  lossTakingCapacityStr = lossTakingCapacity.toFixed(4);
              const lossTakingCapacityIntStr = lossTakingCapacityStr.split(".")[0]! + lossTakingCapacityStr.split(".")[1];
              const lossTakingCapacityInt = Number(lossTakingCapacityIntStr);

              if (pnlInt < -0.9 * lossTakingCapacityInt){
                      const newBlance = pnlInt + order.margin;
                       this.userBalace[userId] = {
                        balance : this.userBalace[userId]!.balance + newBlance;
                        decimal : 4
                       }

              


              this.openOrders[userId] = this.openOrders[userId]!.filter((o) => {
                o.id !== userId
              })

              const closeOrder = {
              ...order,
              closeOrder : assetPrice,
              pnl : pnlInt,
              decimal : 4,
              liquidated : true,
              userId,

              }


              
            }

 




                }


            }
        
     
 }

 private async handleTradeOpen(msg:z.infer<typeof TradeOpenMsg>) : EngineResponseType{

const  tradeInfo = JSON.parse(msg.tradeInfo) as {
  type : orderType,
  asset : string,
  leverage : number,
  quantity : number,
  openprice : number,
  slippage : number
};

const userId = msg.userId
const assetCurrentPrice = this.currentPrice[tradeInfo.asset];

 
 if(!assetCurrentPrice){
   return {
     type : "trade-open-err",
     reqId : msg.reqId,
     playload : {
      message : ""
   }
   }


 }

 if(!this.userBalace[userId]){
  return{
   type : "trade-open-err",
   reqId : msg.reqId,
   playload : {
    message : ""
   }

  }
 }


let assetPrice : number;
let priceDiff : number;

if(tradeInfo.type === "long"){
   assetPrice = assetCurrentPrice.ask_price;
   priceDiff = Math.abs(assetPrice - tradeInfo.openprice);

}else {
  assetPrice = assetCurrentPrice.bid_price;
  priceDiff = Math.abs(assetPrice - tradeInfo.openprice);
}

const priceDiffPercentage = (priceDiff / tradeInfo.openprice) * 100;
if(priceDiffPercentage > tradeInfo.slippage){

return {
   type : "treade-open-err",
   reqId : msg.reqId,
   playload: {
    message :  "slippage exceeded"
   }
  }
}

const margin = (tradeInfo.openprice * tradeInfo.quantity) / (tradeInfo.leverage * 10*4 );
 
 const marginStr = margin.toFixed(4);
 const marginIntStr = marginStr.split(".")[0]! + marginStr.split(".")[1];
 const marginInt = Number(marginIntStr);

 const newBal = this.userBalace[userId].balance - margin;
 if(newBal < 0){
  return {
    type : "trade-open-err",
    reqId : msg.reqId,
    playload : {
      message : "user does not have enough balance"
    }

  }

 }

 const orderId = crypto.randomUUID();

 const order : openOrders = {
   id:  orderId,
   type : tradeInfo.type as unknown as orderType,
   leverage : tradeInfo.leverage,
   asset : tradeInfo.asset,
   margin : marginInt,
   quantity : tradeInfo.quantity,
   openPrice : assetPrice

 };

 (!this.openOrders[userId]){
  this.openOrders[userId] = [];

 }


 this.openOrders[userId].push(order);
 
 



  this.userBalace[userId] = {
    balance : newBal ,
    decimal: 4 

  }

  return{
    type : "trade-open-ack",
    reqId : msg.reqId,
    playload :{
      message: "Order Created",
      orderId,
      order
    }
  }

 }

 private async persistSnapShot () : Promise<void>{
  const db = this.mongo.db(this.dbName);
  const collection = db.collection(this.collectionName);
  this.lastSnapShotAt = Date.now();
  const data = {
          currentPrice : this.currentPrice,
          userBalace : this.userBalace,
          openOrders : this.openOrders,
          lastConsumedStreamId : this.lastConsumedStreamId,
          lastSnapShotAt :  this.lastSnapShotAt 
  }

    await collection.findOneAndReplace(
       {id :"dump"},
       {id: "dump" ,data},
       {upsert : true}
    )
}
  
private async loadSnapShot () : Promise<void>{
  const db = this.mongo.db(this.dbName);
  const collection = db.collection(this.collectionName);
  const doc = await collection.find({id : "dump"});
   if(!doc) return ;
   
    this.currentPrice = doc.data.currentPrice;
    this.userBalace = doc.data.userBalace ,
    this.openOrders = doc.data.openOrders ,
    this.lastConsumedStreamId = doc.data.lastConsumedStreamId ,
     this.lastSnapShotAt = doc.data.lastSnapShotAt  


}


private async handleTradeClose (msg : z.infer<typeof TradeCloseMsg>):Promise<EngineResponseType> {
      
      const userId = msg.userId;
      const orderId = msg.orderId;

       if(!this.userBalace[userId]){
          return {
            type : "close-trade-err",
            reqId : msg.reqId,
            playload : {
                  message : "user does not exist (user does not found in balance array)"               
            }
          }

       }

      let order : openOrders | undefined ;
       this.openOrders[userId]?.forEach(o => {
        if(o.id === orderId){
          order = o;
        }
        
      });

      if(!order){
       return {
        type : "trade-close-err",
        reqId : msg.reqId,
        playload : {
          message : "order does not exist (order does not found in open orders)"
        }
       }
      }

      const assetCurrentPrice = this.currentPrice[order.asset];
      if(!assetCurrentPrice){
        return {
          type : "trade-close-err",
          reqId: msg.reqId,
          playload : {
            message : 'asset does not exist (asset not found in currentprice )'
          }
        }
      }
      let closePrice : number;
      let priceChange : number;
      
      if(order.type === "long"){
       closePrice = assetCurrentPrice.bid_price;
       priceChange = closePrice - order.openPrice;
      }else{
        closePrice = assetCurrentPrice.ask_price;
        priceChange = order.openPrice - closePrice;
 }

  const pnl = (priceChange * order.leverage * order.quantity) / 10 ** 4;
  
  const pnlStr = pnl.toFixed(4);
  const pnlIntStr = pnlStr.split(".")[0]! + pnlStr.split(".")[1];
  const pnlInt = Number(pnlIntStr);

  const newBlance = order.margin + pnl;

  this.userBalace[userId] ={
    balance : this.userBalace[userId].balance + newBlance ,
    decimal : 4,
  }
  
   this.openOrders[userId]?.filter((o)=>{
    o.id !== orderId

   })
  
  const closeOrder = {
    ...order,
    pnlInt,
    closePrice,
    decimal :4,
    liqudated : false,
    userId ,
  }

  return {
   type : "trade-close-ack",
   reqId : msg.reqId,
   playload: {
    message : "Order Closed",
    orderId,
    userBal : this.userBalace[userId]
   }


  }
}


private async handleGetAssetBalance (msg : z.infer<typeof GetAssetbalMsg>):Promise<EngineResponseType> {
   const userId = msg.userId;
   
    const assetBal :AssetBal = {
      "BTC_USDC_PERP" :{balance : 0 ,decimal : 4},
      "ETH_USDC_PERP" : {balance : 0 ,decimal :4},
      "SOL_USDC_PERP" : {balance : 0 ,decimal :4},
  }
      
    this.openOrders[userId]?.forEach( o  => {
      if(o.type === "long" ){
        assetBal[o.asset]!.balance += o.margin;
      }else{
        assetBal[o.asset]!.balance -= o.margin;
      }
      
    });
    
    return{
      type : "get-asset-bal",
      reqId : msg.reqId,
      playload : {
        assetBal
      }
    }


}


}


 