"use client"
import useQuotesStore, { useQuotes } from "../lib/quotesStore";

 export const Trade = () => {
  useQuotes();
 const { selectedSymbol,setselectedSymbol,quotes  } = useQuotesStore();

 const q = quotes[selectedSymbol];


return(
  <div className="w-screen  h-screen overflow-hidden">
 
  Riaz
  
  </div>

  



)


}




