import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Event } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let prisma = new PrismaClient();

  const events = await prisma.event.findMany()

  res.status(200).json(events as Event[] | []);
}