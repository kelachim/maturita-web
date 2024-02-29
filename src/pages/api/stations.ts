import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Station } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let prisma = new PrismaClient();

  const stations = await prisma.station.findMany()

  res.status(200).json(stations as Station[] | []);
}