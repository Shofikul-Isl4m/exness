import { Router } from "express";
import tradeRouter from "./traderRouter";

const router:Router = Router();


router.use("/trade",tradeRouter);
router.use("/balance",balanceRouter);
router.get("/supportedAssets",(req,res) => {
  
  res.json({
    assets :[
            {
                symbol : "BTC_USDC_PERP",
                name : "Bitcoin",
            } ,
            {
                    symbol :"ETH_USDC_PERP",
                    name : "Ethereum"
            },
            {
             symbol : "SOL_USDC_PERP",
             name : "Solana"
            }              
    ]

  })
})

export default router;