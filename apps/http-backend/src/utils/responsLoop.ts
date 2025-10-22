import {engineResponsePuller} from "@repo/redis/queue"
 
 export class ResponseLoop {
    constructor(){
      engineResponsePuller.connect();
      this.runLoop();
    }
    private idResponseMap : Record<string,{
      resolve:(msg?:string)=> void,reject :(msg?:string)=>void
   }> = {}

async runLoop(){
   while (1) {
    const res = await engineResponsePuller.xRead({
         key:"stream:engine:response",
         id:"$"
      },{
         BLOCK : 0 ,COUNT : 1
      })  
      
      if(res){
           const type = res[0]?.messages[0]?.message.type;
           const reqId = res[0]!.messages[0]!.message.reqId!; 

           switch(type){
     case "trade-open-err":
     case  "trade-close-err":
     case "get-user-bal-err":

         const message = JSON.parse(res[0]!.messages[0]!.message.response!).message;
          this.idResponseMap[reqId]!.reject(message) ;
            delete this.idResponseMap[reqId];
            break;
      case "trade-open-ack":{
         const {orderId,order} = JSON.parse(res[0]!.messages[0]!.message.response!)
         this.idResponseMap[reqId]?.resolve(JSON.stringify({order,orderId}))
         delete this.idResponseMap[reqId];
         break;
      }
       
            
      case 'trade-close-ack' : 
      const {orderId ,userBal } = JSON.parse(res[0]!.messages[0]!.message.response!)
      this.idResponseMap[reqId]?.resolve(JSON.stringify({orderId,userBal}))
      delete this.idResponseMap[reqId];
      break;

      case "get-asset-bal-ack" : 
      const assetBal = JSON.parse(res[0]!.messages[0]!.message.response!).assetBal;
      this.idResponseMap[reqId]?.resolve(assetBal);
      delete this.idResponseMap[reqId];
      case "get-user-bal-ack":{
         const userBal = JSON.parse(res[0]!.messages[0]!.message.response!).userBal;
         this.idResponseMap[reqId]!.resolve(userBal);
         delete this.idResponseMap[reqId];
         break;
      }
     case "fetch-open-trades-ack":
      const trades =  JSON.parse(res[0]!.messages[0]!.message.response!).OpenTrades
      this.idResponseMap[reqId]?.resolve(trades);
      delete this.idResponseMap[reqId];
      break;
           }

      }


   }


 
}


 async waitForResponse(reqId:string){
    return new Promise ((resolve,reject) => {
        setTimeout(() => {
         if(this.idResponseMap[reqId]){
         delete this.idResponseMap[reqId];
         reject("response not got within time");
    }}, 3500);
      this.idResponseMap[reqId] = {resolve,reject}

     })
}

 } 
    
 export const responseLoopObj = new ResponseLoop(); 




