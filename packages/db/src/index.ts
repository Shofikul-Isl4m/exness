import { PrismaClient } from './generated/prisma/index.js'


const prismaClientSingleton = () => {
  return new PrismaClient()
}


declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}


const prisma: ReturnType<typeof prismaClientSingleton> = globalThis.prismaGlobal ?? prismaClientSingleton()


export default prisma
export type primaClientType = ReturnType<typeof prismaClientSingleton>


if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma



