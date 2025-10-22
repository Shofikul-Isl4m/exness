import { tradePusher } from "@repo/redis/queue";
import { Request, Response } from "express";
import {CloseOrderSchema, CreateOrderSchema} from "@repo/types/zodSchema"
import { responseLoopObj } from "../utils/responsLoop";

(async()=>{
    await tradePusher.connect()
})()


 const openTradeController =async(req: Request,res:Response ) => {

    const validInput = CreateOrderSchema.safeParse(req.body);

    if(!validInput.success){
        res.status(411).json({
            message :  "invalid input"
        })
        return ;
    }


     const userId  ="1" ;
     const reqId = Date.now().toString() + crypto.randomUUID(); 
     const tradeInfo = JSON.stringify(validInput.data);

     try {
       await tradePusher.xAdd("stream:app:info","*",{
            type: "trade-open",
            tradeInfo,
            userId,
            reqId,
         })
           
        const response = await responseLoopObj.waitForResponse(reqId);
        const {order,orderId } = JSON.parse(response as string);
        res.json({
           message: "trade executed", order,orderId
        })

     } catch (error) {
        res.status(411).json({
            message : `trade not executed ${error}`,error 
        })        
     }

 }


 const fetchTradeController=async (req:Request ,res:Response) =>{
   const userId = "1";
   const reqId = Date.now().toString() + crypto.randomUUID();
try{
   await tradePusher.xAdd(
    "stream:app:info","*",{
        type : "fetch-open-trades",
        userId,
        reqId
    }
   )
     
   const  trades = responseLoopObj.waitForResponse(reqId);
    res.json({
        message : "trade fetched",trades
    }) 
           
}catch(err){
  res.status(411).json({
    message : `trade fetch ${err}`,err
  })


}

 }



 const tradeCloseController = async(req:Request,res:Response) => {
    const validInput = CloseOrderSchema.safeParse(req.body);
    if(!validInput.success){
        res.status(411).json({
            message : "Invalid Input"
        })
        return
    }    
 
  const userId = "1";
  const reqId = Date.now().toString() + crypto.randomUUID();
   const orderId = validInput.data.orderId;

   try {
      await tradePusher.xAdd("stream:app:info","*",{
        type : "trade-close",
        userId,
        reqId,
        orderId
      })  
      
      const trades = responseLoopObj.waitForResponse(reqId);
      res.json({
        message : "Trade Closed",
        trades

      })
   } catch (error) {
      res.status(411).json({
        message : "Trade Close Error" + error,
        error
      })
    
   }
  

 }



