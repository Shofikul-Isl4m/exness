export type FilteredDataType  =  {
 
ask_price : number,
bid_price : number,
decimal : number
}

export type userBalace = {
   balance : number,
   decimal : number
  
}



export type BackpackDataType = {
A: string,
B:string,
E:string,
T:string,
a:string,
b:string,
e:string,
s:string,
u:string

}

export enum orderType  {
  long = "long",
  short = "short"
}  

export type  openOrders = {
  
  id : string,
  openPrice : number,
  leverage:number,
  asset : string,
  margin : number,
  quantity : number,
  type : orderType

}

export type EngineResponseType = {
  type : string,
  reqId : string,
  playload : unknown
}

export type AssetBal = Record<string,
{balance : number,decimal : number}
>
  

