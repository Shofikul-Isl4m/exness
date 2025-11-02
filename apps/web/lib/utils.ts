export function toDecimalNumber(intValue:number,decimal:number){

   if(!Number.isFinite(intValue)) return 0;
   const sign = intValue < 0 ? -1 : 1 ;
   const abs = Math.abs(Math.trunc(intValue));
   if(!decimal || decimal <= 0) return sign * abs;
   const s = String(intValue).padStart(decimal+1,"0");
   const whole = s.slice(0,s.length - decimal);
   const frac = s.slice(s.length - decimal);
   const number = sign * Number(`${whole}.${frac}`)   
   return number


}