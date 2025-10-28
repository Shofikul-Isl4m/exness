export type QuotePayload =Record<string, {
       ask_price : number;
        bid_price : number;
        decimal : number;
    }>

    
type Listner = (data:QuotePayload) => void;

class wsClient {
    constructor(){};

    private ws : WebSocket | null = null;
    private url = process.env.WS_URL! || "ws://localhost:8080";
    private listners = new Set<Listner>();
    private retryMs = 1000;

     connect(){
     if(this.ws) return;         
     this.open();
   document.addEventListener("visibilitychange",this.handleVisibilityChange )
    }
  
   open(){
     this.ws = new WebSocket(this.url);
     this.ws.onopen = () => {
        if(process.env.NODE_ENV === "development"){
            console.log("connected to the ws");
        }
      this.retryMs = 1000;
     }
     this.ws.onclose = () => {
      if(process.env.NODE_ENV === "development"){
        console.log("disconnected from the ws");
      }
      this.rescheduleRecconection
     }
     this.ws.onerror = () => {
      if(process.env.NODE_ENV === "development"){
        console.log("error connecting to the ws");
      }
     this.rescheduleRecconection();
     }

   }
   private rescheduleRecconection(){
    if(this.ws) return;
    this.retryMs *= 2;
    setTimeout(() => this.open(), this.retryMs);
   }

   private handleVisibilityChange(){
    if(document.visibilityState === "visible" || !this.ws){
      this.open();
    }
   }
   subscribe(listner:Listner){
    this.listners.add(listner);
    return () => this.listners.delete(listner);
}

}



export const WsClient = new wsClient();