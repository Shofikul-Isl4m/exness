"use client"
import { useState } from "react";
import useQuotesStore, { useQuotes } from "../lib/quotesStore";
import { Button } from "@repo/ui/Button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useUsdBalance } from "../lib/balance";
import { toDecimalNumber } from "../lib/utils";
import QuotesTable from "./QuotesTable";

 export const Trade = () => {
  useQuotes();
 const { selectedSymbol,setselectedSymbol,quotes  } = useQuotesStore();
 const [showLeft,setShowLeft ] = useState<boolean>(true)
 const [leftWidth,setLeftWidth] = useState(25);
 const rightWidth = 25 ;

 const q = quotes[selectedSymbol];
 const {data : usdBalance , isLoading : isBalanceLoading} = useUsdBalance();




return(
  <div className="w-screen h-screen  overflow-hidden">
    <nav className="flex h-12 items-center justify-between border-b px-3 ">
      <div className="flex items-center bg-amber-500 gap-2">
        <Button 
        variant="ghost"
        size="sm"
        onClick={()=> setShowLeft((v)=> !v)}>
           {showLeft ? <PanelLeftClose className="h-4 w-4"/> : <PanelLeftOpen className="h-4 w-4"/>}
          
        </Button>
      

       <div  className="font-bold">exness</div>
       
      </div>
      <div className="flex items-center gap-3 bg-amber-950"> 
   <span className="text-xs font-semibold text-foreground">
    Availavail:{" "}
  {
    isBalanceLoading ? "Loading.." : toDecimalNumber(usdBalance?.balance!,usdBalance?.decimal!) 
  }


   </span>
   <span className="text-xs font-semibold text-foreground">
    Equity:{" "}
  {
    isBalanceLoading ? "Loading.." : toDecimalNumber(usdBalance?.balance!,usdBalance?.decimal!) 
  }


   </span>


      </div>

     
      </nav>
 
      <main className="flex-1 grid gap-2 p-2" style={{
        gridTemplateColumns : showLeft ? `${leftWidth}% 6px ${100 - rightWidth - leftWidth}% ${rightWidth}` : `1fr ${rightWidth}%`
      }}>
        <aside className="rounded-lg border p-2 ">
          <h4 className="mb-1 mt-0 text-sm font-semibold">Live Prices</h4>
          <QuotesTable/>

        </aside>
        <div></div>
        <div></div>
        <div></div>

        </main>
  
  </div>

  




)

}




