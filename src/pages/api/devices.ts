import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Event, UsbDevice } from "@prisma/client"
import prisma from '../../utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const devices = await prisma.usbDevice.findMany()

  res.status(200).json(devices as UsbDevice[] | []);
}