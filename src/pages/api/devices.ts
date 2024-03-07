import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Event, UsbDevice } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let prisma = new PrismaClient();

  const devices = await prisma.usbDevice.findMany()

  res.status(200).json(devices as UsbDevice[] | []);
}