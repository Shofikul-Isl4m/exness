import { Router } from "express";
import router from ".";


const tradeRouter : Router = Router();




tradeRouter.post("/open",openTradeController);
tradeRouter.get("/open",fetchOpenTrades);
tradeRouter.post("/close",closeTradeController);
tradeRouter.get("close" , fetchClosedTrades)


export default tradeRouter;