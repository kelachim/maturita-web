import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, PrismaClient } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  try {
    let data = req.body;

    console.log(data)

    let usbDevice;

    if (data.device.serial_number) {
      usbDevice = await prisma.usbDevice.findFirst({
        where: { 
            serial_number: data.device.serial_number
        },
      });
    } else if (data.device.vendor_id && data.device.product_id) {
      usbDevice = await prisma.usbDevice.findFirst({
        where: {
          vendor_id: data.device.vendor_id,
          product_id: data.device.product_id,
        },
      });
    }

    if (!usbDevice) {
      usbDevice = await prisma.usbDevice.create({
        data: {
          vendor_id: data.device.vendor_id,
          product_id: data.device.product_id,
          description: data.device.description,
          serial_number: data.device.serial_number,
          files: data.device.files 
        },
      });
    }


    const event = await prisma.event.create({
      data: {
        id: data.id,
        user: data.user,
        variation: data.variation,
        tracked: data.tracked,
        station: {
          connect: {
            id: data.station_id,
          },
        },
        usbdevice: {
          connect: {
            id: usbDevice.id,
          },
        },
      },
    });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  } finally {
    await prisma.$disconnect();
  }
}
