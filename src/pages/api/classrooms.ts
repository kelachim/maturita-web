import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, type UsbDevice } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  const classroom = await prisma.classroom.findMany({include: {
    stations: true
  }})

  res.status(200).json(classroom);
}