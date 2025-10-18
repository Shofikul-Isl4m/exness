import { tradePusher } from "@repo/redis/queue"
import { json, Request, Response } from "express"
import {createOrderSchema } from "@repo/types/zodSchema"


(async()=>{
    await tradePusher.connect()
})()


 const openTradeController =async(req: Request,res:Response ) => {

    const validInput = createOrderSchema.safeParse(req.body);

    if(!validInput.success){
        res.status(411).json({
            message :  "invalid input"
        })
        return
    }


     const userId  ="1" ;
     const reqId = Date.now().toString() + crypto.randomUUID(); 
     const tradeInfo = JSON.stringify(validInput.data);

     tradePusher.xAdd("stream:app:info","*",{
        type: "trade-open",
        tradeInfo,
        userId,
        reqId,
     })


 
     

 }