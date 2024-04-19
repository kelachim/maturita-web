import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, UsbDevice } from "@prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
 
  const data = await prisma.usbDevice.findMany({where: {tracked: true}, select: {vendor_id: true, product_id: true, description: true, serial_number: true, files: true}});
  res.status(200).json(data || []);
}