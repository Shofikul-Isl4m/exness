import express from "express"
import cookieParser from "cookie-parser"
import router from "./router";


const app = express();


 app.use(express.json());
 app.use(cookieParser());
 app.use("/api/v1",router);


app.listen(3001,()=> {
    console.log("listening to port : 3001");
})