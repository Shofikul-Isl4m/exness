import { Router } from "express";
import { fetchClosedTrades, fetchOpenTrades, openTradeController, tradeCloseController } from "../controller/tradeController";


const tradeRouter : Router = Router();




tradeRouter.post("/open",openTradeController);
tradeRouter.get("/open",fetchOpenTrades);
tradeRouter.post("/close",tradeCloseController);
tradeRouter.get("close" , fetchClosedTrades)


export default tradeRouter;