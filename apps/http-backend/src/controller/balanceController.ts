import { Request, Response } from "express";
import {httpPusher} from "@repo/redis/queue"
import { responseLoopObj } from "../utils/responsLoop";


export const getAssetBalanceController = async(req:Request,res:Response) => {

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



export const getUserBalController =async (req : Request,res : Response ):Promise<any> =>  {
    const userId = "1"; 
    const reqId = Date.now().toString() + crypto.randomUUID();

    try {
        await httpPusher.xAdd("stream:app:info","*",{
            type : "get-user-bal",
            userId ,
            reqId  
        })
        
   
       const data = await responseLoopObj.waitForResponse(reqId);
   
       res.json({
           message : "User Bal : " , data  
       })
   
      } catch (error) {
        console.log(error);
   res.status(411).json({
  
    message : "Get User Balance failed ",error 
   })
           
   }  
 

}

