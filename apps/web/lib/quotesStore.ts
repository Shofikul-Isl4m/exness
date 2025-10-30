"use client"

import { create } from "zustand"
import { QuotePayload, WsClient } from "./ws"
import { useEffect } from "react"
import { wstoSymbol } from "./symbol"

type QuoteState = {
    selectedSymbol : string,
    setselectedSymbol : (symbol:string) => void
    quotes : QuotePayload,
    setQuotes : (quotes:QuotePayload) => void
}

export const useQuotesStore = create<QuoteState>((set) => ({
    selectedSymbol : "",
    setselectedSymbol : (symbol) => set({selectedSymbol:symbol}),
    quotes : {},
    setQuotes : (quotes) => set({quotes:quotes}),
}))

export const useQuotes = () => {

    useEffect(()=>{
       
        WsClient.connect();
    const unsubscribe = WsClient.subscribe((quotes:QuotePayload) => {
        const {setQuotes} =useQuotesStore()
        const mapped : QuotePayload = {} 
        for(const [key,value] of Object.entries(quotes)){
          mapped[wstoSymbol(key)]  = value as typeof quotes[string] ;
        }

        const prev = useQuotesStore.getState().quotes;
        let changed = false;
        const mappedkeys = Object.keys(mapped);
        const prevKeys = Object.keys(prev);
        if(mappedkeys.length !== prevKeys.length){
           changed = true;

        }else{
            for (const key of mappedkeys){
                const a = prev[key];                
                const b = mapped[key];
                if(!a || 
                    a.ask_price !== b!.ask_price 
                    || a.bid_price !== b!.bid_price){
                        changed = true;
                    }
            }
        }

        if(changed){
            setQuotes(mapped)
        }
    });
      return () => {
        unsubscribe()
      }
    },[])
     
      }



export default useQuotesStore;