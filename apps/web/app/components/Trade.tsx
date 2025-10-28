import { useState } from "react";
import useQuotesStore, { useQuotes } from "../lib/quotesStore";

export const Trade = () => {
  useQuotes();
 const { selectedSymbol,setselectedSymbol,quotes  } = useQuotesStore();

 const q = quotes[selectedSymbol];


return(

  



)


}



export default Trade;
