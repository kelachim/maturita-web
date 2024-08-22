import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, type Event } from "@prisma/client"
import prisma from '../../utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const events = await prisma.event.findMany()

  res.status(200).json(events as Event[] | []);
}