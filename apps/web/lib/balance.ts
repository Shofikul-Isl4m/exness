import { useQuery } from "@tanstack/react-query";
import api from "./api";

type usdBalance = {
    balance: number,
    decimal : number
}

 export const useUsdBalance = () => {
     return useQuery<usdBalance>({
        queryKey : ["balance.usd"],
        queryFn: async ()=>{
     const {data} = await api.get("/balance/usd");
    return data;
        },

    staleTime : 2500,
    refetchInterval : 2500
     })
     

} 