

import prisma from "@repo/db/client";
import { Engine } from "./engineClass";
import {enginePuller,enginePusher} from "@repo/redis/queue"


 const EngineObj  = new Engine(
    enginePuller,
    enginePusher,
    prisma,
    mo
 )

 EngineObj.run();