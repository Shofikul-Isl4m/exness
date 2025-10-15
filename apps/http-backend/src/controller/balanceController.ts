import { Request, Response } from "express";
import {httpPusher} from "@repo/redis/queue"
export const getUsdBalanceController = async(req:Request,res:Response) => {

    const userId = Date.now().toString + crypto.randomUUID();
    const reqId = Date.now().toString + crypto.randomUUID();


    try {
       await httpPusher.xAdd("stream:app:info","*",{
            type : "get-asset-bal",
            reqId,
            userId
        })
       
     const data = await responseLoopObj.waitForResponse(reqId);

     console.log(data);



     res.json({
            message : "Fetched asset balance Successfully",
             data

     })
    } catch (error) {
        console.log(error);
        res.status(411).json({
            message : "Coudn't fetch asset balance"
        })
        
    }

}