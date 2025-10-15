import { typeOfRedisClientType } from "@repo/redis/index"
import client from "@repo/redis/index"
export class Engine {
     constructor (
        private readonly enginePuller : typeOfRedisClientType,
        private readonly enginePusher : typeOfRedisClientType
     )  {}


     private readonly streamKey = "stream:app:info";
     private readonly groupName = "group-1"
     private readonly consumerName ="consumer-1"
     private lastConsumedStreamId = ""
     private lastSnapShotAt = Date.now()

     async run() :Promise<void> {
       await this.enginePuller.connect();
       await this.enginePusher.connect();
         
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

  



}