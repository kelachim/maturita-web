import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../utils/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { deviceId } = req.body;

  const event = await prisma.usbDevice.findFirst({where: {id: deviceId}})
  const data = await prisma.usbDevice.update({where: {id: deviceId}, data: {tracked: !event?.tracked}})

  res.status(200).json(data);
}