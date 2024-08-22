import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../utils/prisma'
import type { Station } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const stations = await prisma.station.findMany()

  res.status(200).json(stations as Station[] | []);
}