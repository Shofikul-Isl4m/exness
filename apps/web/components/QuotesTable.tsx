
import useQuotesStore from "../lib/quotesStore"


export default function QuotesTable(){

    const quotes = useQuotesStore((s) => s.quotes)
    const rows = Object.entries(quotes); 
return(
   
<div className="overflow-y-auto">
    <table>
    <thead>
        <tr>
            <th className="border-b px-2 py-2 ">
                symbol
            </th>
            <th>
              ask price
            </th>
            <th>
                bid price
            </th>
        </tr>
        </thead>
        <tbody>
           {
            rows.map(([symbol,q])=>
                <tr>
            <td>
                {symbol}
            </td>
            <td>
            {q.ask_price}
            </td>
            <td>
                {q.bid_price}
            </td>
        </tr>
                )
           }
           
        </tbody>
    </table>



</div>

)



}