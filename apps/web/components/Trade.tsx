"use client"
import useQuotesStore, { useQuotes } from "../lib/quotesStore";
import { Button } from "@repo/ui/Button";

 export const Trade = () => {
  useQuotes();
 const { selectedSymbol,setselectedSymbol,quotes  } = useQuotesStore();

 const q = quotes[selectedSymbol];


return(
  <div className="w-screen h-screen overflow-hidden">
    <nav className="flex h-full items-center justify-between border-b px-3 ">
      Riaz
          
  
      
      
 
      
      </nav>
 
  Riaz
  
  </div>

  



)


}




