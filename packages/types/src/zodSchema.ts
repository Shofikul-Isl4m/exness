import z, { string } from "zod";


export const CreateOrderSchema = z.object({
    asset : z.string(),
    type : z.enum(["long","short"]),
    quantity : z.number(),
    leverage : z.number(),
    slippage : z.number(),
    openPrice : z.number(),
    decimal : z.number()

})

export const CloseOrderSchema = z.object({
    orderId : z.string()
})


 
    



export const BaseMsg = z.object({reqId : z.string() ,type : z.string});

export const userAuthMsg = BaseMsg.extend({
    type : z.literal(["user-signup","user-signin"]),
    userId : z.string
})

export const PriceUpdateMsg = BaseMsg.extend({
    type : z.literal("price-update"),
    tradePrices : z.string()

})

export const  GetUserBalMsg = BaseMsg.extend({
    type : z.literal("get-user-bal"),
    userId : z.string()

})

export const TradeOpenMsg = BaseMsg.extend({

    type : z.literal("trade-open"),
    reqId : z.string(),
    userId : z.string(),
    tradeInfo : z.string()

})

export const TradeCloseMsg = BaseMsg.extend({
   type : z.literal("trade-close"),
   userId : z.string(),
   orderId : z.string()

})

export const GetAssetbalMsg = BaseMsg.extend({
    type : z.literal("get-asset-bal"),
    userId : z.string(),
})

export const FetchOpenTradesMsg = BaseMsg.extend({
    type : z.literal("fetch-open-trades"),
    userId : z.string(),
})





export const MessageSchema = z.discriminatedUnion("type",[
   userAuthMsg,
   PriceUpdateMsg,
   TradeOpenMsg,
   TradeCloseMsg,
   GetAssetbalMsg,
   GetUserBalMsg,
   FetchOpenTradesMsg
])

export type Message = z.infer<typeof MessageSchema>;