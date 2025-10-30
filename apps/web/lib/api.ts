import axios from "axios";


  function resolveProdBase ():string | undefined{
  
   const envBase =  process.env.NEXT_PUBLIC_API_BASE as string | undefined;
   if(envBase) return envBase;
   
   if(typeof window !== "undefined"){
    const {protocol,hostname } = window.location;
       return `${protocol}//${hostname}:3001/api/v1`
   }
   return undefined;

}

const baseURL = resolveProdBase();

 const api = axios.create({
baseURL,
withCredentials:true,
headers : {
    "Content-Type" :"application/json"
}

})


axios.interceptors.response.use(
(response) => response,
(error) => Promise.reject(error)




)


export default api; 
