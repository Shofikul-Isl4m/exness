import { Router } from "express";

const balanceRouter : Router = Router();

balanceRouter.get("/open",getUsdBalanceController)
