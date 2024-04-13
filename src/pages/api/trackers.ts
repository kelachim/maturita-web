import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  console.log(req.body.eventId)

  const { eventId } = req.body;

  const event = await prisma.event.findFirst({where: {id: eventId}})
  const data = await prisma.event.update({where: {id: eventId}, data: {tracked: !event?.tracked}})

  res.status(200).json([]);
}